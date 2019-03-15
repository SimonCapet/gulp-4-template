import { Vehicle, IVehicleState, ValidatedVehicle } from 'shared/models';
import { validate } from 'shared/services/validator';
import { generateVehicleValidator } from 'ukbc/validation-rules';

export function ValidateVehicle(vehicle: Vehicle, vehicles?: IVehicleState[]): ValidatedVehicle {
	return validate(generateVehicleValidator(vehicle, vehicles), vehicle);
}
