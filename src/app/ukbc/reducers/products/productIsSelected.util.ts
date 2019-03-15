import { State } from 'ukbc/reducers/products/state.model';
import { IProduct } from 'ukbc/models';

export function ProductIsSelected(state: State, product: IProduct): boolean {
	return !!state.selectedProducts.find(stateProduct => stateProduct.ProductCode === product.ProductCode);
}
