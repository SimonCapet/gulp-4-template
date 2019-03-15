import { sortBy } from 'sort-by-typescript';

import { EBaseProductPrefix } from 'ukbc/enums';
import * as productActions from 'ukbc/actions/product.actions';
import { IInitialState, IProduct, IStepConfig, IStandardProduct } from 'ukbc/models';
import { getSessionStorageReducerState } from 'shared/helpers';
import { State } from 'ukbc/reducers/products/state.model';

import { MapProductList } from 'ukbc/reducers/products/mapProductList.util';
import { GenerateBitSet } from 'ukbc/reducers/products/generateBitSet.util';
import { SelectProduct, DeselectProduct } from 'ukbc/reducers/products/selectDeselectProduct.util';
import { ProductIsSelected } from 'ukbc/reducers/products/productIsSelected.util';
import { SetPreventSelection } from 'ukbc/reducers/products/setPreventSelection.util';
import { MaxProductsOfType } from 'ukbc/reducers/products/maxProductsOfType.util';
import { SetIncludedAsStandardProducts } from 'ukbc/reducers/products/setIncludedAsStandardProducts.util';
import { SetHistoricalSelectedProducts } from 'ukbc/reducers/products/setHistoricalProducts.util';

export { State } from 'ukbc/reducers/products/state.model';

const ukbcInitialState: IInitialState = (<any>window).UKBC_initialState;
const preSelectedProductCodes = <string[]>ukbcInitialState.ContentInformation.Journey.PreSelectedProducts;

const initialProductList: IProduct[] = ukbcInitialState.ContentInformation.ProductList;
const steps: IStepConfig[] = ukbcInitialState.ContentInformation.Journey.Steps;
const standardProducts: IStandardProduct[] = ukbcInitialState.ContentInformation.Journey.IncludeStandardProducts;
const productsInPackage = ukbcInitialState.ContentInformation.Journey.ProductsInPackage;
const lcpMaxAdditionalMembers = ukbcInitialState.ContentInformation.GeneralInfo.LCPMaxAdditionalMembers;

const savedState: State = getSessionStorageReducerState('products');

const allProducts = MapProductList(initialProductList, preSelectedProductCodes, steps);
const preSelectedProducts = preSelectedProductCodes.map(productCode => allProducts.find(product => product.ProductCode === productCode));

export const initialState: State = savedState || {
	allProducts,
	selectedProducts: preSelectedProducts,
	preSelectedProducts,
	productsInPackage,
	historicalSelectedProducts: preSelectedProducts,
	bitSet: GenerateBitSet(allProducts.filter(product => preSelectedProductCodes.find(ProductCode => ProductCode === product.ProductCode))),
	includedAsStandardProducts: SetIncludedAsStandardProducts(standardProducts, preSelectedProducts),
};

export function reducer(state: State = initialState, action: productActions.Actions): State {
	const newState = { ...state };

	switch (action.type) {
		case productActions.CONFIRM_SELECT_PRODUCT:
		case productActions.CONFIRM_DESELECT_PRODUCT: {
			const adding = action.type === productActions.CONFIRM_SELECT_PRODUCT;

			for (let productCode of action.payload.productCodes) {
				// The LCP product doesn't have any numbers but we use these to track the cover level,
				// in order to match the product in the available products we need to strip the numbers for LCP.
				productCode = productCode.includes(EBaseProductPrefix.LCP) ? EBaseProductPrefix.LCP : productCode;

				const product = state.allProducts.find(prod => prod.ProductCode === productCode);

				if (product) {
					if (adding) {
						newState.selectedProducts = SelectProduct(newState, product);
						newState.historicalSelectedProducts = SetHistoricalSelectedProducts(newState.historicalSelectedProducts, product);
					} else {
						if (ProductIsSelected(newState, product)) {
							newState.selectedProducts = DeselectProduct(newState, product);

							if (product.ParentProduct) {
								// This will ensure that when PBM products are deselected from the basket and then added back again that it will
								// always add PBM1 back rather than however many people were originally selected
								const smallestRelatedProduct = state.allProducts
									.filter(p => p.ParentProduct === product.ParentProduct)
									.sort(sortBy('ProductCode'))[0];

								newState.historicalSelectedProducts = SetHistoricalSelectedProducts(
									newState.historicalSelectedProducts,
									smallestRelatedProduct
								);
							}
						}
					}
				}
				newState.allProducts = SetPreventSelection(newState.allProducts, product, !ProductIsSelected(state, product));
			}

			newState.bitSet = GenerateBitSet(newState.selectedProducts);
			newState.includedAsStandardProducts = SetIncludedAsStandardProducts(standardProducts, newState.selectedProducts);

			return newState;
		}
		default:
			return state;
	}
}

export function getMaxLCPProducts(state: State): number {
	// Max allowed members for LCP.
	return lcpMaxAdditionalMembers;
}

export function getMaxPbmProducts(state: State): number {
	return MaxProductsOfType(state.allProducts, EBaseProductPrefix.PBM);
}

export function getMaxVbmProducts(state: State): number {
	return MaxProductsOfType(state.allProducts, EBaseProductPrefix.VBM);
}

export const getAllProducts = (state: State) => state.allProducts;
export const getProduct = (state: State, productCode: string): IProduct =>
	state.allProducts.find(product => product.ProductCode === productCode);
export const getSelectedProducts = (state: State) => state.selectedProducts;
export const getSelectedProductCodes = (state: State) => state.selectedProducts.map(product => product.ProductCode);
export const getHistoricalProducts = (state: State) => state.historicalSelectedProducts;
export const getBasketProducts = (state: State) =>
	state.selectedProducts.filter(product => !product.HideProductFromUI).sort(sortBy('index'));
export const getBitSet = (state: State) => state.bitSet;
export const getIncludedAsStandardProducts = (state: State) => state.includedAsStandardProducts;
export const getProductsInPackage = (state: State) => state.productsInPackage;

export const getBasisValues = (state: State) => {
	const basisProduct = state.selectedProducts.find(p => !!p.ParentProduct);
	const basisNumbers = getBasisProductCodes(state).map(p => parseInt(p.replace(/[^0-9.]/g, ''), 10));

	return {
		Value: parseInt(basisProduct.ProductCode.replace(/[^0-9.]/g, ''), 10),
		Min: Math.min(...basisNumbers),
		Max: Math.max(...basisNumbers),
	};
};

export const getBasisProductCodes = (state: State) => {
	const basisProduct = state.selectedProducts.find(p => !!p.ParentProduct);

	return state.allProducts.filter(p => p.ParentProduct === basisProduct.ParentProduct).map(p => p.ProductCode);
};

export const getCoverBasisType = (state: State) => <EBaseProductPrefix>getBasisProductCodes(state)[0].replace(/[0-9.]/g, '');

export const getAvailableParentProducts = (state: State) => {
	const basisProducts = state.allProducts.filter(p => p.ParentProduct);
	return Array.from(new Set(basisProducts.map(p => p.ParentProduct)));
};
