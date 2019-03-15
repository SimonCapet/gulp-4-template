import { IProduct, IStandardProduct } from 'ukbc/models';

export interface State {
	allProducts: IProduct[];
	selectedProducts: IProduct[];
	preSelectedProducts: IProduct[];
	historicalSelectedProducts: IProduct[];
	includedAsStandardProducts: IStandardProduct[];
	productsInPackage: string[];
	bitSet: number;
}
