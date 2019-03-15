import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/withLatestFrom';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { EPaymentCardType, EErrorCode, ECardCategory, EPurchaseType } from 'ukbc/enums';
import * as fromRoot from 'ukbc/reducers';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import * as paymentActions from 'ukbc/actions/payment.actions';
import * as cardActions from 'ukbc/actions/card.actions';
import * as errorActions from 'ukbc/actions/error.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import { CheckoutAnalyticsService, PaymentService, PricingService } from 'ukbc/services';
import { BeginSetFrequencyAction } from 'ukbc/actions/pricing.actions';
import { ChangePurchaseTypeRemoveProductComponent } from 'ukbc/components/product/disallowed-purchase-type/change-purchase-type-remove-product.component';

// TODO: move this to validation service
const detailsCompleted = state => {
	return !!state.contacts[0].FirstName;
};

@Injectable()
export class PricingEffects {
	constructor(
		private actions$: Actions,
		private store$: Store<fromRoot.State>,
		private paymentService: PaymentService,
		private pricingService: PricingService,
		private checkoutAnalyticsService: CheckoutAnalyticsService
	) {}

	@Effect()
	product$: Observable<Action> = this.actions$
		.ofType(
			pricingActions.BEGIN_SET_FREQUENCY,
			pricingActions.CONFIRM_SET_FREQUENCY,
			paymentActions.SET_PURCHASE_TYPE,
			pricingActions.GET_PRICES,
			pricingActions.SET_POLICY_DURATION
		)
		.withLatestFrom(this.store$)
		.map(([action, state]) => {
			return { action, state, bitSet: state.products.bitSet };
		})
		.switchMap(({ action, state, bitSet }) => {
			switch (action.type) {
				case pricingActions.GET_PRICES:
					return Observable.fromPromise(this.pricingService.GetPrices(bitSet, state.eagleEye.tokenValue))
						.mergeMap(data => {
							return [{ type: pricingActions.SET_PRICES, payload: data }];
						})
						.catch(error => {
							if (!error.handled) {
								this.checkoutAnalyticsService.TrackServerError('price lookup failure');

								return [
									new pricingActions.ResetPricingAction(),
									new errorActions.ShowErrorAction({
										errorCode: error.name === 'TimeoutError' ? EErrorCode.GetPricesTimeout : EErrorCode.GetPricesError,
										action: new pricingActions.GetPricesAction(),
										hideCloseButton: true,
									}),
								];
							}
						});
				case pricingActions.BEGIN_SET_FREQUENCY:
					const beginSetFrequencyAction = action as BeginSetFrequencyAction;
					const newPurchaseType: EPurchaseType = beginSetFrequencyAction.payload;
					const selectedProductsForWhichNewFrequencyIsDisallowed = state.products.selectedProducts.filter(
						p => p.DisallowedPurchaseType === newPurchaseType
					);
					if (selectedProductsForWhichNewFrequencyIsDisallowed.length > 0) {
						const actions = [];
						for (const product of selectedProductsForWhichNewFrequencyIsDisallowed) {
							actions.push(
								new dialogActions.CreateDialogAction({
									id: 'change-purchase-type-remove-product',
									component: ChangePurchaseTypeRemoveProductComponent,
									componentInputs: { product, purchaseTypeBeingSelected: newPurchaseType },
									open: true,
									hideCloseButton: true,
								})
							);
						}
						return actions;
					} else {
						return [new pricingActions.ConfirmSetFrequencyAction(newPurchaseType)];
					}
				case pricingActions.CONFIRM_SET_FREQUENCY:
					return [new paymentActions.SetPurchaseTypeAction(state.pricing.frequency)];
				case pricingActions.SET_POLICY_DURATION:
					return [new paymentActions.SetPolicyDurationAction(state.pricing.duration)];
				case paymentActions.SET_PURCHASE_TYPE:
					const actions = [];
					const cardState = state.card;
					if (cardState.openCardType && cardState.openCardType === EPaymentCardType.CardPayment) {
						actions.push(new cardActions.OpenCard(EPaymentCardType.PaymentDetails));
					}
					if (!cardState.openCardType) {
						// if toggling the annual/monthly and not on the payment step, then we must invalidate the payment iframe
						actions.push(new cardActions.InvalidateCardsInCategory(ECardCategory.Payment));
					}
					this.paymentService.LoadPaymentOptions(state.payment.payment.model, paymentActions.SET_PURCHASE_TYPE, [], cardState.openCardType);
					return actions;
			}
		});
}
