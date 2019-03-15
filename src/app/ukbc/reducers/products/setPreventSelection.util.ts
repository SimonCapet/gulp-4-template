import { IProduct } from 'ukbc/models';
import { EPreventSelectReason } from 'ukbc/enums';

export function SetPreventSelection(products: IProduct[], product: IProduct, productSelected: boolean): IProduct[] {
	const updatedProducts = products.map(p => {
		const productCopy: IProduct = Object.assign({}, p);

		if (p.PreReqProduct === product.ProductCode) {
			if (productSelected) {
				productCopy.PreventSelect = productCopy.PreventSelect.filter(r => r !== EPreventSelectReason.PrerequisiteProduct);
			} else if (!productCopy.PreventSelect.includes(EPreventSelectReason.PrerequisiteProduct)) {
				productCopy.PreventSelect.push(EPreventSelectReason.PrerequisiteProduct);
			}
		}

		return productCopy;
	});

	return [...updatedProducts];
}
