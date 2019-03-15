import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from 'app/ukbc/reducers/index';
import * as productActions from 'ukbc/actions/product.actions';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import { DisallowedPurchaseTypeBaseDialogComponent } from 'ukbc/components/product/disallowed-purchase-type/disallowed-purchase-type-base-dialog.component'; // tslint:disable-line max-line-length
import { EProductSelectionSource, EPurchaseType } from 'ukbc/enums';

@Component({
	selector: 'ukbc-change-purchase-type-remove-product',
	templateUrl: './disallowed-purchase-type-base-dialog.component.html',
	styleUrls: ['./disallowed-purchase-type-base-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ChangePurchaseTypeRemoveProductComponent extends DisallowedPurchaseTypeBaseDialogComponent {
	@Input() purchaseTypeBeingSelected: EPurchaseType;
	@Input() setOnClose: Function;

	constructor(public store: Store<fromRoot.State>) {
		super(store, 'change-purchase-type-remove-product');
	}

	public ConfirmSelection() {
		this.store.dispatch(new pricingActions.ConfirmSetFrequencyAction(this.purchaseTypeBeingSelected));

		this.store.dispatch(
			new productActions.ConfirmDeselectProductAction({
				productCodes: [this.product.ProductCode],
				source: EProductSelectionSource.ChangePurchaseTypeRemoveProductModal,
			})
		);

		this.CloseDialog();
	}

	public get Description(): string {
		return this.product.ChangePurchaseTypeRemoveProductsModalDescription;
	}

	public get ConfirmationButtonText(): string {
		return this.product.ChangePurchaseTypeRemoveProductsModalConfirmationButtonText;
	}

	public get CancelButtonText(): string {
		return this.product.ChangePurchaseTypeRemoveProductsModalCancelButtonText;
	}
}
