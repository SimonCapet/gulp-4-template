import { IInitialState, IVehicleState, IProduct, Vehicle } from 'ukbc/models';
import { GetProductsThatApplyToVehicles } from 'ukbc/helpers';
import { CreateVehicleAtIndex } from 'ukbc/reducers/vehicles/createVehicleAtIndex.util';
import { ValidateVehicle } from 'ukbc/reducers/vehicles/validateVehicle.util';
import { GetProductsRelatedToVehicle } from 'ukbc/reducers/vehicles/getProductsRelatedToVehicle.util';
import { SetCalculateVehicleValues } from 'ukbc/reducers/vehicles/setCalculatedVehicleValues.util';

const initialState = <IInitialState>(<any>window).UKBC_initialState;
const contentInformation = initialState.ContentInformation;
const productList = contentInformation.ProductList;
const preSelectedProductCodes = contentInformation.Journey.PreSelectedProducts;
const preSelectedProducts = productList.filter(product => preSelectedProductCodes.includes(product.ProductCode));
const preSelectedVehicles = initialState.PreSelectedVehicles;

export function CreateInitialVehicles(): IVehicleState[] {
	let vehicles: IVehicleState[] = [];

	const productsThatApplyToVehicles = GetProductsThatApplyToVehicles(preSelectedProducts);

	if (preSelectedVehicles && preSelectedVehicles.length) {
		preSelectedVehicles.forEach(({ Vrm, Make, Model, Mileage, Year, Fuel }, index) => {
			let vehicle = new Vehicle(Vrm, Make, Model, Year, Mileage, Fuel);

			const productsRelatedToVehicle = GetProductsRelatedToVehicle(index, productsThatApplyToVehicles).filter(
				product => !!product.VehicleRules
			);

			productsRelatedToVehicle.forEach(product => {
				const { ProductCode } = product;

				if (!vehicle.ProductRules.find(rule => rule.ProductCode === ProductCode)) {
					vehicle.ProductRules.push({ ProductCode, ...product.VehicleRules });
				}
			});

			vehicle = SetCalculateVehicleValues(vehicle);

			const validatedVehicle = ValidateVehicle(vehicle);

			vehicles.push(<IVehicleState>{
				...validatedVehicle,
				manuallyEditing: !validatedVehicle.isValid,
			});
		});
	}

	productsThatApplyToVehicles.forEach(product => {
		// Array of indexes that this product and it's rules should apply to.
		const vehicleIndexes = product.AppliesToVehicles.map((value, index) => (value ? index : null)).filter(item => item !== null);

		vehicleIndexes.forEach(index => {
			if (!vehicles[index]) {
				vehicles = CreateVehicleAtIndex(vehicles, index, preSelectedProducts);
			}
		});
	});

	return vehicles;
}
