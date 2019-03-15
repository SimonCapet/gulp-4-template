import * as vehicleActions from 'ukbc/actions/vehicle.actions';

import { getSessionStorageReducerState } from 'shared/helpers';
import { IVehicles, IInitialState } from 'ukbc/models';
import { IVehicleState } from 'shared/models';
import { CreateInitialVehicles } from 'ukbc/reducers/vehicles/createInitialVehicles.util';
import { RemoveVehicleAtIndex } from 'ukbc/reducers/vehicles/removeVehicleAtIndex.util';
import { CreateVehicleAtIndex } from 'ukbc/reducers/vehicles/createVehicleAtIndex.util';
import { SetProductRulesForVehicle } from 'ukbc/reducers/vehicles/setProductRulesForVehicle.util';
import { SetVehicleField } from 'ukbc/reducers/vehicles/setVehicleField.util';
import { SetManuallyEditVehicle } from 'ukbc/reducers/vehicles/setManuallyEditVehicle.util';
import { SetCalculateVehicleValues } from 'ukbc/reducers/vehicles/setCalculatedVehicleValues.util';
import { ValidateVehicle } from 'ukbc/reducers/vehicles/validateVehicle.util';

const UKBC_initialState = <IInitialState>(<any>window).UKBC_initialState;
const contentInformation = UKBC_initialState.ContentInformation;
const preSelectedVehicles = UKBC_initialState.PreSelectedVehicles;
export const PreSelectedProducts = contentInformation.Journey.PreSelectedProducts;

export type State = IVehicles;

let initialState: State = getSessionStorageReducerState('vehicles', true);

if (!initialState) {
	const hasPreSelectedVehicles = preSelectedVehicles && preSelectedVehicles.length;
	const vehicles = CreateInitialVehicles();

	let completedVehicles = [];
	let openVehicle = '';

	if (hasPreSelectedVehicles) {
		completedVehicles = vehicles.filter(v => v.isValid).map(v => v.model.Id);

		const firstInvalidVehicle = vehicles.find(v => !v.isValid);

		if (firstInvalidVehicle) {
			openVehicle = firstInvalidVehicle.model.Id;
		}
	}

	initialState = {
		vehicles,
		completedVehicles,
		openVehicle,
	};
}

export function reducer(state: State = initialState, action: vehicleActions.Actions): State {
	switch (action.type) {
		case vehicleActions.AUTOMATICALLY_ADD_VEHICLE: {
			const vehicles = CreateVehicleAtIndex(state.vehicles, action.payload.index, action.payload.selectedProducts);

			let openVehicle = state.openVehicle;

			// If no vehicle is open and they have not all been completed, open the new vehicle
			if (state.completedVehicles.length < vehicles.length) {
				openVehicle = vehicles.find(vehicle => !state.completedVehicles.includes(vehicle.model.Id)).model.Id;
			}
			return {
				...state,
				vehicles,
				openVehicle,
			};
		}
		case vehicleActions.AUTOMATICALLY_REMOVE_VEHICLE: {
			const vehicles = RemoveVehicleAtIndex(state.vehicles);
			const vehicleIds = vehicles.map(vehicle => vehicle.model.Id);
			const completedVehicles = state.completedVehicles.filter(id => vehicleIds.includes(id));

			// If the open vehicle has been removed, open the first vehicle that has not been completed
			let openVehicle;

			if (completedVehicles.length && completedVehicles.length < vehicles.length) {
				openVehicle = vehicles.find(vehicle => !completedVehicles.includes(vehicle.model.Id)).model.Id;
			}

			return { vehicles, openVehicle, completedVehicles };
		}
		case vehicleActions.SET_PRODUCT_RULES_FOR_VEHICLE: {
			const vehicles = SetProductRulesForVehicle(state.vehicles, action.payload.index, action.payload.selectedProducts);
			const erroredVehicles = vehicles.filter(vehicle => {
				const errors = vehicle.validationErrors;

				return errors.Age || errors.Fuel || errors.Make || errors.Mileage || errors.Model || errors.Vrm || errors.Year;
			});
			const completedVehicles = state.completedVehicles.filter(id => !erroredVehicles.find(vehicle => vehicle.model.Id));

			return { ...state, vehicles, completedVehicles };
		}
		case vehicleActions.SET_VEHICLE_FIELD: {
			return { ...state, vehicles: SetVehicleField(state.vehicles, action) };
		}
		case vehicleActions.SET_VEHICLE_MANUAL_EDIT: {
			return { ...SetManuallyEditVehicle(state, action.payload.id, action.payload.manualEdit) };
		}
		case vehicleActions.OPEN_VEHICLE: {
			const vehicleIds = state.vehicles.map(v => v.model.Id);
			return {
				...state,
				openVehicle: action.payload.id,
				completedVehicles: state.completedVehicles.filter(id => vehicleIds.indexOf(id) < vehicleIds.indexOf(action.payload.id)),
			};
		}
		case vehicleActions.SET_VEHICLE_DETAILS: {
			return {
				...state,
				vehicles: state.vehicles.map(
					currentVehicle =>
						currentVehicle.model.Id !== action.payload.Id
							? currentVehicle
							: { ...ValidateVehicle(SetCalculateVehicleValues(action.payload), state.vehicles), manuallyEditing: true }
				),
			};
		}
		case vehicleActions.COMPLETE_VEHICLE: {
			const completedVehicles = [...state.completedVehicles, action.payload.id];
			const uncompletedVehicles = state.vehicles.filter(v => completedVehicles.indexOf(v.model.Id) === -1);
			const nextUncompletedVehicle = uncompletedVehicles[0];
			return {
				...state,
				completedVehicles,
				openVehicle: !nextUncompletedVehicle ? '' : nextUncompletedVehicle.model.Id,
			};
		}
		default: {
			return state;
		}
	}
}

export const getVehicles = (state: State): State => state;
export const getInvalidVehicles = (state: State): IVehicleState[] => state.vehicles.filter(vehicle => !vehicle.isValid);
export const getCompletedVehicles = (state: State): string[] => state.completedVehicles;
export const getInvalidAgeVehicles = (state: State): IVehicleState[] =>
	getInvalidVehicles(state).filter(
		vehicle =>
			(vehicle.model.Year || 0).toString().length === 4 &&
			vehicle.validationErrors.Age &&
			vehicle.validationErrors.Age.find(error => error.type === 'max')
	);
export const getInvalidMileageVehicles = (state: State): IVehicleState[] =>
	getInvalidVehicles(state).filter(
		vehicle => vehicle.validationErrors.Mileage && vehicle.validationErrors.Mileage.find(error => error.type === 'max')
	);
export const getInvalidFuelVehicles = (state: State): IVehicleState[] =>
	getInvalidVehicles(state).filter(
		vehicle => vehicle.validationErrors.Fuel && vehicle.validationErrors.Fuel.find(error => error.type === 'notInArray')
	);
export const getVehiclesValidAndCompleted = (state: State): boolean =>
	getCompletedVehicles(state).length && !getInvalidVehicles(state).length;
