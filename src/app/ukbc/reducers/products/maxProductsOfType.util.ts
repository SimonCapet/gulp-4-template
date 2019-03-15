import { IProduct } from 'ukbc/models';

export function MaxProductsOfType(allProducts: IProduct[], type: string): number {
	return allProducts.filter(p => p.ProductCode.includes(type) && p.ParentProduct === type).length;
}
