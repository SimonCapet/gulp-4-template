import { State } from 'ukbc/reducers/vehicles/vehicles.reducer';
import { ValidateVehicle } from 'ukbc/reducers/vehicles/validateVehicle.util';
import { SetCalculateVehicleValues } from 'ukbc/reducers/vehicles/setCalculatedVehicleValues.util';

export function SetManuallyEditVehicle(stateCopy: State, id: string, manuallyEditing: boolean) {
	const vehicles = stateCopy.vehicles.map(vehicle => {
		if (vehicle.model.Id === id) {
			vehicle.manuallyEditing = manuallyEditing;

			if (!manuallyEditing) {
				vehicle.isValid = false;
				vehicle.model = SetCalculateVehicleValues({
					...vehicle.model,
					Year: null,
					Make: null,
					Model: null,
					Fuel: null,
					LookupResponse: null,
				});

				return {
					...ValidateVehicle(vehicle.model, stateCopy.vehicles),
					manuallyEditing,
				};
			}
		}

		return vehicle;
	});

	return Object.assign({}, stateCopy, { vehicles });
}
