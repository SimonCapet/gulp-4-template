import { IProduct } from 'ukbc/models';

export function SetHistoricalSelectedProducts(historicalProducts: IProduct[], productToAdd: IProduct): IProduct[] {
	let newProducts = [...historicalProducts];

	if (productToAdd.ParentProduct) {
		newProducts = newProducts.filter(p => p.ParentProduct !== productToAdd.ParentProduct);
	}

	if (!newProducts.find(p => p.ProductCode === productToAdd.ProductCode)) {
		newProducts.push(productToAdd);
	}

	return newProducts;
}
