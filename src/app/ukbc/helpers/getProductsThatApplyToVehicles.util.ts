import { IProduct } from 'ukbc/models';

export function GetProductsThatApplyToVehicles(products: IProduct[]): IProduct[] {
	return products.filter(product => product.AppliesToVehicles && product.AppliesToVehicles.includes(true));
}
