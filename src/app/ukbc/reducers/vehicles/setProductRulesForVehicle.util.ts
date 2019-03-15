import { IVehicleState, IProduct } from 'ukbc/models';
import { GetProductsRelatedToVehicle } from 'ukbc/reducers/vehicles/getProductsRelatedToVehicle.util';
import { IVehicleProductRules } from 'shared/models';
import { SetCalculateVehicleValues } from 'ukbc/reducers/vehicles/setCalculatedVehicleValues.util';
import { ValidateVehicle } from 'ukbc/reducers/vehicles/validateVehicle.util';

export function SetProductRulesForVehicle(state: IVehicleState[], index: number, selectedProducts: IProduct[]): IVehicleState[] {
	// Create fresh vehicles array to ensure our reducers run in an immutable way
	return [...state].map((vehicle, i) => {
		if (i === index) {
			const relatedProducts = GetProductsRelatedToVehicle(index, selectedProducts).filter(product => !!product.VehicleRules);

			vehicle.model.ProductRules = relatedProducts.map(
				product => <IVehicleProductRules>{ ProductCode: product.ProductCode, ...product.VehicleRules }
			);

			vehicle.model = SetCalculateVehicleValues(vehicle.model);

			return <IVehicleState>{
				...ValidateVehicle(vehicle.model),
				manuallyEditing: vehicle.manuallyEditing,
			};
		}

		return vehicle;
	});
}
