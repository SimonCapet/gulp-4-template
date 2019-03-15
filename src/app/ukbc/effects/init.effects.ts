import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { withLatestFrom, map, tap } from 'rxjs/operators';

import { State } from 'ukbc/reducers';
import { SetProductRulesForVehicle, CreateDialogAction, CompleteCard, OpenCard } from 'ukbc/actions';
import { IInitialState } from 'ukbc/models';
import { VehicleRulesDialogComponent } from 'ukbc/components/product-modals/vehicle-rules-dialog.component';
import { EDetailsCardType, EStepType } from 'ukbc/enums';
import { PrefillCard } from 'ukbc/actions/card.actions';

const isRenewal = (<IInitialState>(<any>window).UKBC_initialState).IsRenewal;

@Injectable()
export class InitEffects {
	constructor(private actions$: Actions, private store$: Store<State>) {}

	@Effect({ dispatch: false })
	init$: Observable<{ action: Action; state: State }> = this.actions$.ofType('@ngrx/effects/init').pipe(
		withLatestFrom(this.store$),
		map(([action, state]) => {
			return { action, state };
		}),
		tap(({ action, state }) => {
			// This is required to reset the vehicle product rules if the user refreshes the page half way through completing a Vehicle rules modal
			state.vehicles.vehicles.forEach((vehicle, index) => {
				this.store$.dispatch(new SetProductRulesForVehicle({ index, selectedProducts: state.products.selectedProducts }));
			});

			let checkRenewalInfo = false;
			if (isRenewal) {
				const currentJourneyStep = state.step.find(step => step.status.current);
				checkRenewalInfo = true;
				// do not run if the details and payment step
				if (currentJourneyStep && currentJourneyStep.type === EStepType.DetailsAndPayment) {
					checkRenewalInfo = false;
				}
			}
			if (checkRenewalInfo) {
				const vehiclesState = state.vehicles;

				const VSOEProducts = state.products.selectedProducts.filter(
					p =>
						p.AppliesToVehicles &&
						p.AppliesToVehicles.includes(true) &&
						p.VehicleRules &&
						(p.VehicleRules.FuelType || p.VehicleRules.MaxAge || p.VehicleRules.MaxMileage)
				);

				VSOEProducts.forEach(product => {
					product.AppliesToVehicles.forEach((applies, index) => {
						if (applies) {
							const vehicle = vehiclesState.vehicles[index];

							if (!vehicle.isValid) {
								this.store$.dispatch(
									new CreateDialogAction({
										id: 'vehicle-rules-dialog',
										open: true,
										component: VehicleRulesDialogComponent,
										componentInputs: {
											selectedProducts: state.products.selectedProducts,
											vehicleRulesProducts: VSOEProducts,
										},
									})
								);
							}
						}
					});
				});

				if (isRenewal && vehiclesState.vehicles.length) {
					if (vehiclesState.completedVehicles.length === vehiclesState.vehicles.length) {
						this.store$.dispatch(new CompleteCard(EDetailsCardType.Vehicles));
						this.store$.dispatch(new PrefillCard(EDetailsCardType.Vehicles));
					} else {
						this.store$.dispatch(new OpenCard(EDetailsCardType.Vehicles));
					}
				}
			}
		})
	);
}
