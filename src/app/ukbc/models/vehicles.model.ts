import { IVehicleState } from 'shared/models/vehicle.model';
import { EFuelType } from 'shared/enums';
import { IProduct } from 'ukbc/models';

export interface IVehicles {
	vehicles: Array<IVehicleState>;
	completedVehicles: Array<string>;
	openVehicle: string;
}

export interface IAddRemoveVehiclePayload {
	index: number;
	selectedProducts: IProduct[];
}

export interface IInitialVehicle {
	Vrm: string;
	Make: string;
	Model: string;
	Year: number;
	Mileage?: number;
	Fuel?: EFuelType;
}
