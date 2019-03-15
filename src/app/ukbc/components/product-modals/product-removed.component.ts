import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from 'ukbc/reducers';
import * as productActions from 'ukbc/actions/product.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import * as questionActions from 'ukbc/actions/question.actions';
import { EProductSelectionSource } from 'ukbc/enums';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-product-removed',
	templateUrl: './product-removed.component.html',
	styleUrls: ['./product-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ProductRemovedComponent {
	@Input() content: string;
	@Input() moreInfoButtonText: string;
	@Input() moreInfoText: string;
	@Input() confirmButtonText: string;
	@Input() cancelButtonText: string;
	@Input() questionId: string;
	@Input() productCodesBeingRemoved: string[];
	@Input() productCodesRequiringProducts: string[];
	@Input() setOnClose: Function;

	constructor(private store: Store<fromRoot.State>, private analyticsService: CheckoutAnalyticsService) {}

	public IsMoreInfoOpen = false;

	public ConfirmRemoval() {
		this.store.dispatch(
			new productActions.ConfirmDeselectProductAction({
				productCodes: [...this.productCodesBeingRemoved, ...this.productCodesRequiringProducts],
				source: EProductSelectionSource.ProductModal,
			})
		);
		this.CloseDialog(false);
	}

	public CloseDialog(track = true) {
		this.store.dispatch(new dialogActions.CloseDialogAction('product-removed'));

		if (this.questionId) {
			this.store.dispatch(new questionActions.AnswerQuestion(this.questionId));
		}

		if (track) {
			this.analyticsService.TrackEvent('ProductRemovalDecline', {
				declinedProductsToRemove: [...this.productCodesBeingRemoved, ...this.productCodesRequiringProducts],
			});
		}
	}

	public ToggleMoreInfoOpen() {
		this.IsMoreInfoOpen = !this.IsMoreInfoOpen;
	}
}
