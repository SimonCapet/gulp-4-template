import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { EPaymentCardType, ESaveCoverSource } from 'ukbc/enums';

import * as fromRoot from 'ukbc/reducers';
import * as paymentActions from 'ukbc/actions/payment.actions';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import * as cardActions from 'ukbc/actions/card.actions';

import { PaymentService, CoverService } from 'ukbc/services';
import { SetPurchaseType } from 'ukbc/reducers/payment/set-purchase-type.util';
import { SetPolicyDuration } from 'ukbc/reducers/payment/set-policy-duration.util';

@Injectable()
export class PaymentEffects {
	constructor(
		private actions$: Actions,
		private store$: Store<fromRoot.State>,
		private paymentService: PaymentService,
		private coverService: CoverService
	) {}

	@Effect({ dispatch: false })
	loadTime$: Observable<any> = this.actions$.ofType(paymentActions.SAVE_IFRAME_LOADING_TIME).pipe(
		map((action: paymentActions.SaveIframeLoadingTime) => action.payload),
		switchMap(timings => {
			return this.paymentService.saveRealexTimings(timings);
		})
	);

	@Effect({ dispatch: false })
	payment$: Observable<any> = this.actions$
		.ofType(
			paymentActions.SET_PAYMENT_METHOD,
			paymentActions.SET_DIRECT_DEBIT_PAYMENT_METHOD,
			paymentActions.SET_PAYMENT_OPTIONS,
			paymentActions.SET_PAYMENT_OPTIONS_AND_REALEX_MODEL,
			paymentActions.SET_PURCHASE_TYPE,
			paymentActions.SET_POLICY_DURATION,
			paymentActions.RESET_PAYMENT_OPTIONS
		)
		.withLatestFrom(this.store$)
		.map(([action, state]) => {
			return { action, state };
		})
		.do(({ action, state }) => {
			const paymentState = state.payment;
			switch (action.type) {
				case paymentActions.SET_PAYMENT_METHOD:
					this.paymentService.LoadPaymentOptions(
						paymentState.payment.model,
						paymentActions.SET_PAYMENT_METHOD,
						[action],
						state.card.openCardType
					);
					break;
				case paymentActions.SET_DIRECT_DEBIT_PAYMENT_METHOD:
					this.coverService.SaveCover(ESaveCoverSource.ChangeDirectDebitPaymentMethod, <EPaymentCardType>state.card.openCardType);
					break;
				case paymentActions.RESET_PAYMENT_OPTIONS:
					this.paymentService.LoadPaymentOptions(
						paymentState.payment.model,
						paymentActions.RESET_PAYMENT_OPTIONS,
						[action],
						state.card.openCardType
					);
					break;
				case paymentActions.SET_PURCHASE_TYPE:
					SetPurchaseType(state.payment, state.pricing.frequency);
					break;
				case paymentActions.SET_POLICY_DURATION:
					SetPolicyDuration(state.payment, state.pricing.duration);
					this.paymentService.LoadPaymentOptions(
						paymentState.payment.model,
						paymentActions.SET_PAYMENT_METHOD,
						[action],
						state.card.openCardType
					);
					break;
			}
		});
}
