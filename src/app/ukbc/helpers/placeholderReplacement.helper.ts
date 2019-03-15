import { IPrice, IProduct } from 'ukbc/models';
import { toPounds } from 'shared/helpers';

const PRODUCT_PRICE_PLACEHOLDER = '(price)';
const PRODUCT_PRICE_BY_CODE_PLACEHOLDER_REGEX = /\(price-(.+?)\)/;
const PRODUCT_BASIS_PLACEHOLDER = '(basis)';
const EAGLE_EYE_TOKEN_VALUE_PLACEHOLDER = '(eagleEyeTokenValue)';

const getProductPrice = (productCode: string, pricing: IPrice): string =>
	!!pricing.prices && toPounds(pricing.prices[productCode] ? pricing.prices[productCode].Diff : null);

export function replaceProductPricePlaceholder(text: string | null, product: IProduct, pricing: IPrice): string | null {
	if (text == null) {
		return null;
	}

	let result = text;
	result = result.replace(PRODUCT_PRICE_PLACEHOLDER, placeholder => getProductPrice(product.ProductCode, pricing));
	result = result.replace(PRODUCT_PRICE_BY_CODE_PLACEHOLDER_REGEX, (placeholder, productCode) => getProductPrice(productCode, pricing));
	return result;
}

export const replaceEagleEyeTokenValuePlaceholder = (text: string | null, eagleEyeTokenValue: number) =>
	text == null ? null : text.replace(EAGLE_EYE_TOKEN_VALUE_PLACEHOLDER, toPounds(eagleEyeTokenValue));
