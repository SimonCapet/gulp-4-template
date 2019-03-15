import { IProduct, IStepConfig } from 'ukbc/models';
import { EBaseProductPrefix, EPreventSelectReason } from 'ukbc/enums';

export function MapProductList(products: IProduct[], preSelectedProducts: string[], steps: IStepConfig[]): IProduct[] {
	return products.map((p, index) => {
		const canRemove =
			(p.ProductCode.includes(EBaseProductPrefix.PBM) || p.ProductCode.includes(EBaseProductPrefix.VBM)) &&
			typeof parseInt(p.ProductCode.slice(-1), 10) === 'number'
				? parseInt(p.ProductCode.slice(-1), 10) > 1
				: true;

		const PreventSelect = [];

		if (p.PreReqProduct && !preSelectedProducts.find(preselectedProduct => preselectedProduct === p.PreReqProduct)) {
			PreventSelect.push(EPreventSelectReason.PrerequisiteProduct);
		}

		const product: IProduct = Object.assign(p, { canRemove, PreventSelect });
		// Product index is used for product ordering in a basket
		product.index = 0;

		const productStepIndex = steps.findIndex(step => step.Products && !!step.Products.find(sp => sp === p.ProductCode));

		if (productStepIndex > -1) {
			const productIndex = steps[productStepIndex].Products.findIndex(sp => sp === p.ProductCode);
			product.index = productStepIndex * 10 + productIndex;
		}

		return product;
	});
}
