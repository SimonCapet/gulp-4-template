import { IStandardProduct, IProduct } from 'ukbc/models';

export function SetIncludedAsStandardProducts(standardProducts: IStandardProduct[], selectedProducts: IProduct[]): IStandardProduct[] {
	const selectedProductsCodes = selectedProducts.map(product => product.ProductCode);

	const newProducts = standardProducts
		? standardProducts.filter(standardProduct => {
				// These variables are used as the initialState will contain [""] rather than an empty array or null if there are no product codes
				const isConditionallyShown = standardProduct.ShowWhenProductSelected.some(productCode => !!productCode.length);
				const isConditionallyHidden = standardProduct.HideWhenProductSelected.some(productCode => !!productCode.length);

				let show = true;
				let hide = false;

				if (isConditionallyShown) {
					show = standardProduct.ShowWhenProductSelected.every(productCode => selectedProductsCodes.includes(productCode));
				}

				if (show && isConditionallyHidden) {
					hide = standardProduct.HideWhenProductSelected.every(productCode => selectedProductsCodes.includes(productCode));
				}

				return show && !hide;
			})
		: [];

	return newProducts;
}
