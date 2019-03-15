export function getProductWithoutNumber(productCode: string): string {
	return productCode.replace(/[0-9]/g, '');
}
