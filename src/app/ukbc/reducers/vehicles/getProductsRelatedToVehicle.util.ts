import { IProduct } from 'ukbc/models';
import { GetProductsThatApplyToVehicles } from 'ukbc/helpers';

export function GetProductsRelatedToVehicle(index: number, products: IProduct[]): IProduct[] {
	return GetProductsThatApplyToVehicles(products).filter(product => product.AppliesToVehicles[index]);
}
