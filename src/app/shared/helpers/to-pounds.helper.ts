import { EPriceType } from 'ukbc/enums';

export const toPounds = (price: number | null, zeroAsFree = true, alwaysShowPence = false): string => {
	if (zeroAsFree && price === 0) {
		return EPriceType.Free;
	}

	if (price < 0) {
		return '';
	}

	if (!!price && price % 1 !== 0) {
		return `£${price.toFixed(2)}`;
	}

	if (price != null && alwaysShowPence) {
		return `£${price}.00`;
	}

	return price ? `£${price.toString().split('.')[0]}` : '£0';
};
