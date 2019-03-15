import 'rxjs/add/operator/map';
import 'rxjs/add/operator/withLatestFrom';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import * as fromRoot from 'ukbc/reducers';
import * as vehicleActions from 'ukbc/actions/vehicle.actions';
import * as cardActions from 'ukbc/actions/card.actions';

import { EDetailsCardType, EPaymentCardType } from 'ukbc/enums';

import { getFirstUncompletedCard } from 'ukbc/reducers/card/getFirstUncompletedCardForStep.util';

@Injectable()
export class VehicleEffects {
	constructor(private actions$: Actions, private store$: Store<fromRoot.State>) {}

	@Effect()
	product$: Observable<Action> = this.actions$
		.ofType(
			vehicleActions.AUTOMATICALLY_ADD_VEHICLE,
			vehicleActions.AUTOMATICALLY_REMOVE_VEHICLE,
			vehicleActions.SET_PRODUCT_RULES_FOR_VEHICLE,
			vehicleActions.COMPLETE_VEHICLE,
			cardActions.COMPLETE_CARD
		)
		.withLatestFrom(this.store$)
		.map(([action, state]) => {
			return { action, state };
		})
		.switchMap(({ action, state }) => {
			const actions = [];
			const numberOfVehicles = state.vehicles.vehicles.length;

			const sectionCardState = state.card;

			if (action.type === vehicleActions.AUTOMATICALLY_ADD_VEHICLE && numberOfVehicles > 1) {
				if (isNextCardVehicles(sectionCardState)) {
					actions.push(new cardActions.OpenCard(EDetailsCardType.Vehicles));
				} else {
					actions.push(new cardActions.OpenFirstUncompletedCard());
				}
			}

			if (action.type === vehicleActions.SET_PRODUCT_RULES_FOR_VEHICLE) {
				state.vehicles.vehicles.forEach(vehicle => {
					if (vehicle.model.MileageRule && (!vehicle.model.Mileage || vehicle.validationErrors.Mileage)) {
						actions.push(new vehicleActions.MarkLookupUncompleted(vehicle));

						if (isNextCardVehicles(sectionCardState)) {
							actions.push(new cardActions.OpenCard(EDetailsCardType.Vehicles));
						}
					}
				});
			}

			if (action.type === cardActions.COMPLETE_CARD) {
				const vehiclesCardIsBeingOpened = isNextCardVehicles(sectionCardState);
				const vehiclesCardIsComplete = sectionCardState.completedCardTypes.indexOf(EDetailsCardType.Vehicles) !== -1;
				if (vehiclesCardIsBeingOpened && !vehiclesCardIsComplete) {
					const firstVehicle = state.vehicles.vehicles[0];
					const firstVehicleId = !!firstVehicle ? firstVehicle.model.Id : '';

					if (state.vehicles.completedVehicles.length === state.vehicles.vehicles.length) {
						actions.push(new cardActions.CompleteCard(EDetailsCardType.Vehicles));
					} else {
						actions.push(new vehicleActions.OpenVehicle({ id: firstVehicleId }));
					}
				}
			}

			const vehicleCard = sectionCardState.cards.find(c => c.type === EDetailsCardType.Vehicles);

			if (action.type === vehicleActions.AUTOMATICALLY_ADD_VEHICLE && numberOfVehicles > 0 && vehicleCard && !vehicleCard.visible) {
				actions.push(new cardActions.SetCardVisibility({ type: EDetailsCardType.Vehicles, visible: true }));

				if (state.vehicles.openVehicle && isNextCardVehicles(sectionCardState)) {
					actions.push(new cardActions.OpenCard(EDetailsCardType.Vehicles));
					actions.push(new vehicleActions.OpenVehicle({ id: state.vehicles.openVehicle }));
				}
			}

			if (action.type === vehicleActions.AUTOMATICALLY_REMOVE_VEHICLE && numberOfVehicles === 0 && vehicleCard && vehicleCard.visible) {
				actions.push(new cardActions.SetCardVisibility({ type: EDetailsCardType.Vehicles, visible: false }));
			}

			if (
				action.type === vehicleActions.AUTOMATICALLY_REMOVE_VEHICLE &&
				state.vehicles.vehicles.length &&
				state.vehicles.completedVehicles.length === state.vehicles.vehicles.length &&
				sectionCardState.openCardType === EDetailsCardType.Vehicles
			) {
				actions.push(new cardActions.CompleteCard(EDetailsCardType.Vehicles));
			}

			if (
				action.type === vehicleActions.AUTOMATICALLY_REMOVE_VEHICLE &&
				!state.vehicles.vehicles.length &&
				sectionCardState.openCardType === EDetailsCardType.Vehicles
			) {
				actions.push(new cardActions.CalculateNextOpenCard(EDetailsCardType.Vehicles));
			}

			return actions;
		});
}

function isNextCardVehicles(sectionCardState): boolean {
	return getFirstUncompletedCard(sectionCardState).type === EDetailsCardType.Vehicles;
}
