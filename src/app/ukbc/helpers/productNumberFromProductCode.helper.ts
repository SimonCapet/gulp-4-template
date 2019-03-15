export function getProductNumberFromProductCode(productCode: string): number {
	return parseInt(productCode.slice(-1), 10);
}
