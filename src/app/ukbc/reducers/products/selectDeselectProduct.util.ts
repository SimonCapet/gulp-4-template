import { State } from 'ukbc/reducers/products/state.model';
import { IProduct } from 'ukbc/models';

export function SelectProduct(state: State, product: IProduct) {
	let selectedProducts = [...state.selectedProducts];

	// Deselect other siblings if there are any and are not hidden
	if (product.ParentProduct) {
		selectedProducts = selectedProducts.filter(p => !p.ParentProduct);
	}

	if (product.PreReqProduct && !selectedProducts.find(p => p.ProductCode === product.PreReqProduct)) {
		const preReqProduct = state.allProducts.find(p => p.ProductCode === product.PreReqProduct);
		selectedProducts.push(preReqProduct);
	}

	if (!selectedProducts.find(p => p.ProductCode === product.ProductCode)) {
		selectedProducts.push(product);
	}

	return selectedProducts;
}

export function DeselectProduct(state: State, product: IProduct): IProduct[] {
	let selectedProducts = [...state.selectedProducts].filter(p => p.ProductCode !== product.ProductCode);

	if (!!product.ParentProduct) {
		const parentProduct = state.allProducts.find(p => p.ProductCode === product.ParentProduct);

		selectedProducts = selectedProducts.filter(p => p.ParentProduct !== product.ParentProduct);

		if (parentProduct && parentProduct.AlternateProductCodes && parentProduct.AlternateProductCodes.length) {
			for (let i = 0, l = parentProduct.AlternateProductCodes.length; i < l; i++) {
				const productCode = parentProduct.AlternateProductCodes[i];

				const productToSelect = state.allProducts.find(p => p.ProductCode === `${productCode}1`);

				if (productToSelect) {
					selectedProducts.push(productToSelect);

					break;
				}
			}
		}
	}

	// If any selected products require this product to be selected then remove them
	selectedProducts = selectedProducts.filter(p => p.PreReqProduct !== product.ProductCode);

	return selectedProducts;
}
