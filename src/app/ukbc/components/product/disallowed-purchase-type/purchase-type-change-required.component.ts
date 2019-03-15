import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from 'app/ukbc/reducers/index';
import * as productActions from 'ukbc/actions/product.actions';
import * as questionActions from 'ukbc/actions/question.actions';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import { DisallowedPurchaseTypeBaseDialogComponent } from 'ukbc/components/product/disallowed-purchase-type/disallowed-purchase-type-base-dialog.component'; // tslint:disable-line max-line-length
import { EProductSelectionSource, EPurchaseType } from 'ukbc/enums';

@Component({
	selector: 'ukbc-purchase-type-change-required',
	templateUrl: './disallowed-purchase-type-base-dialog.component.html',
	styleUrls: ['./disallowed-purchase-type-base-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PurchaseTypeChangeRequiredComponent extends DisallowedPurchaseTypeBaseDialogComponent {
	@Input() questionId: string;
	@Input() setOnClose: Function;

	constructor(public store: Store<fromRoot.State>) {
		super(store, 'purchase-type-change-required');
	}

	public ConfirmSelection() {
		const newPurchaseType: EPurchaseType =
			this.product.DisallowedPurchaseType === EPurchaseType.Monthly ? EPurchaseType.Annual : EPurchaseType.Monthly;

		this.store.dispatch(new pricingActions.BeginSetFrequencyAction(newPurchaseType));

		this.store.dispatch(
			new productActions.ConfirmSelectProductAction({
				productCodes: [this.product.ProductCode],
				source: EProductSelectionSource.PurchaseTypeChangeRequiredModal,
			})
		);
		this.CloseDialog();
	}

	public CloseDialog() {
		super.CloseDialog();

		if (this.questionId) {
			this.store.dispatch(new questionActions.AnswerQuestion(this.questionId));
		}
	}

	public get Description(): string {
		return this.product.PurchaseTypeChangeRequiredModalDescription;
	}

	public get ConfirmationButtonText(): string {
		return this.product.PurchaseTypeChangeRequiredModalConfirmationButtonText;
	}

	public get CancelButtonText(): string {
		return this.product.PurchaseTypeChangeRequiredModalCancelButtonText;
	}
}
