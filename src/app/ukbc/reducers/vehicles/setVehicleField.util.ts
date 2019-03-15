import { IVehicleState, Vehicle } from 'shared/models';
import * as vehicleActions from 'ukbc/actions/vehicle.actions';
import { ValidateVehicle } from 'ukbc/reducers/vehicles/validateVehicle.util';
import { SetCalculateVehicleValues } from 'ukbc/reducers/vehicles/setCalculatedVehicleValues.util';

export function SetVehicleField(vehicles: IVehicleState[], action: vehicleActions.SetVehicleField): IVehicleState[] {
	return [...vehicles].map(vehicle => {
		if (vehicle.model.Id === action.payload.vehicle.Id) {
			for (const key in vehicle.model) {
				if (vehicle.model.hasOwnProperty(key) && typeof vehicle.model[key] === 'string') {
					vehicle.model[key] = vehicle.model[key].trim();
				}
			}

			let updatedModel: Vehicle = {
				...vehicle.model,
				[action.payload.field]: action.payload.value,
				LookupResponse: null,
			};

			// Reset all fields but VRM and mileage if not in manual edit mode
			if (!vehicle.manuallyEditing && (action.payload.field === 'Vrm' || action.payload.field === 'Mileage')) {
				updatedModel = { ...updatedModel, Year: null, Make: null, Model: null, Fuel: null, LookupResponse: null };
			}

			return {
				...ValidateVehicle(SetCalculateVehicleValues(updatedModel), vehicles),
				manuallyEditing: vehicle.manuallyEditing,
			};
		}

		return vehicle;
	});
}
