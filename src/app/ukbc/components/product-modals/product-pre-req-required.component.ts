import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IPrice, IProduct } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';
import * as productActions from 'ukbc/actions/product.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import * as questionActions from 'ukbc/actions/question.actions';
import { replaceProductPricePlaceholder } from 'ukbc/helpers';
import { EProductSelectionSource } from 'ukbc/enums';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-product-prereq-required',
	templateUrl: './product-pre-req-required.component.html',
	styleUrls: ['./product-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ProductPreReqRequiredComponent {
	@Input() productBeingAdded: IProduct;
	@Input() questionId: string;
	@Input() setOnClose: Function;

	public isMoreInfoOpen = false;
	public AddProductButtonPriceSuffix$: Observable<string>;

	constructor(private store: Store<fromRoot.State>, private analyticsService: CheckoutAnalyticsService) {
		this.pricing$ = store.select(fromRoot.getPricing);
		this.AddProductButtonPriceSuffix$ = store.select(fromRoot.getAddProductButtonPriceSuffix);
	}

	private pricing$: Observable<IPrice>;

	public ConfirmSelection() {
		this.store.dispatch(
			new productActions.ConfirmSelectProductAction({
				productCodes: [this.productBeingAdded.ProductCode, this.productBeingAdded.PreReqProduct],
				source: EProductSelectionSource.ProductModal,
			})
		);
		this.CloseDialog(false);
	}

	public CloseDialog(track = true) {
		this.store.dispatch(new dialogActions.CloseDialogAction('confirm-prereq-required'));

		if (this.questionId) {
			this.store.dispatch(new questionActions.AnswerQuestion(this.questionId));
		}

		if (track) {
			this.analyticsService.TrackEvent('PrerequisiteAddDecline', {
				declinedProductsToAdd: [this.productBeingAdded.ProductCode, this.productBeingAdded.ProductCode],
			});
		}
	}

	private replacePlaceholders(text: string) {
		return this.pricing$.map(pricing => replaceProductPricePlaceholder(text, this.productBeingAdded, pricing));
	}

	public get Description(): Observable<string> {
		return this.replacePlaceholders(this.productBeingAdded.PreReqRequiredModalDescription);
	}

	public get MoreInfoLink(): Observable<string | null> {
		return this.replacePlaceholders(this.productBeingAdded.PreReqRequiredModalMoreInfoLink);
	}

	public get MoreInfoText(): Observable<string | null> {
		return this.replacePlaceholders(this.productBeingAdded.PreReqRequiredModalMoreInfoText);
	}

	public get ConfirmationButtonText(): Observable<string> {
		return this.replacePlaceholders(this.productBeingAdded.PreReqRequiredModalConfirmationButtonText);
	}

	public get CancelButtonText(): Observable<string> {
		return this.replacePlaceholders(this.productBeingAdded.PreReqRequiredModalCancelButtonText);
	}

	public get Price(): Observable<number | null> {
		return this.pricing$.map(pricing => {
			const productPrice = pricing.prices[this.productBeingAdded.ProductCode] ? pricing.prices[this.productBeingAdded.ProductCode].Diff : 0;
			const preReqProductPrice = pricing.prices[this.productBeingAdded.PreReqProduct]
				? pricing.prices[this.productBeingAdded.PreReqProduct].Diff
				: 0;
			return !!pricing && productPrice + preReqProductPrice;
		});
	}

	public ToggleMoreInfoOpen() {
		this.isMoreInfoOpen = !this.isMoreInfoOpen;
	}
}
