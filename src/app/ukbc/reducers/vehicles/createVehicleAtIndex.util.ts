import { IVehicleState, Vehicle, IProduct } from 'ukbc/models';
import { GetProductsRelatedToVehicle } from 'ukbc/reducers/vehicles/getProductsRelatedToVehicle.util';
import { ValidateVehicle } from 'ukbc/reducers/vehicles/validateVehicle.util';
import { SetCalculateVehicleValues } from 'ukbc/reducers/vehicles/setCalculatedVehicleValues.util';

export function CreateVehicleAtIndex(state: IVehicleState[], index: number, products: IProduct[]): IVehicleState[] {
	// Create fresh vehicles array to ensure our reducers run in an immutable way
	let vehicles = [...state];

	let vehicle = vehicles[index];

	if (!vehicle) {
		for (let i = 0; i <= index; i++) {
			if (i === index) {
				vehicle = <IVehicleState>{
					...ValidateVehicle(new Vehicle()),
					manuallyEditing: false,
				};

				vehicles.push(vehicle);
			} else {
				vehicles = CreateVehicleAtIndex(vehicles, i, products);
			}
		}
	}

	if (vehicle) {
		const productsRelatedToVehicle = GetProductsRelatedToVehicle(index, products).filter(product => !!product.VehicleRules);

		productsRelatedToVehicle.forEach(product => {
			const { ProductCode } = product;

			if (!vehicle.model.ProductRules.find(rule => rule.ProductCode === ProductCode)) {
				vehicle.model.ProductRules.push({ ProductCode, ...product.VehicleRules });
			}
		});

		vehicle.model = SetCalculateVehicleValues(vehicle.model);
	}

	return vehicles;
}
