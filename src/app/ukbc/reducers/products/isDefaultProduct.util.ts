import { IProduct } from 'ukbc/models';

export function IsDefaultProduct(preSelectedProducts: string[], product: IProduct): boolean {
	return !!preSelectedProducts.find(p => p === product.ProductCode);
}
