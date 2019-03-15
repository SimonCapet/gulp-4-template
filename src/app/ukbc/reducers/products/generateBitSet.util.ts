import { IProduct } from 'ukbc/models';

export function GenerateBitSet(products: IProduct[]): number {
	return products.reduce((a: any, b: any) => (a.CoverOptionType ? a.CoverOptionType : a) + b.CoverOptionType, 0);
}
