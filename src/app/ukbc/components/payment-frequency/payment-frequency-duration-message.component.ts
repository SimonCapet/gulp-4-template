import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { IValidated } from 'shared/models/validation.model';
import { IPaymentState, IPayment, IGeneralContent, IDialog } from 'ukbc/models';

import { getPaymentState, State } from 'ukbc/reducers';
import * as dialogActions from 'ukbc/actions/dialog.actions';

import * as fromRoot from 'ukbc/reducers';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { PaymentFrequencyDialogComponent } from 'ukbc/components/payment-frequency/payment-frequency-dialog.component';

@Component({
	selector: 'ukbc-payment-frequency-duration-message',
	templateUrl: './payment-frequency-duration-message.component.html',
	styleUrls: ['./payment-frequency-duration-message.component.scss'],
})
export class PaymentFrequencyDurationMessageComponent implements OnInit, OnDestroy {
	private payment$: Observable<IPaymentState>;
	private subscriptions: Subscription[] = [];
	public PaymentDetails: IValidated<IPayment>;
	private dialogs$: Observable<IDialog[]>;
	public Content$: Observable<IGeneralContent>;
	public Content: IGeneralContent;
	public TwoYearPolicyMessage: string;
	public PolicyDetailsTellMeMoreInfo: string;
	public PolicyDetailsTellMeMoreLabel: string;

	private dialogActionName: 'policydurationtellmemore';

	constructor(private store: Store<State>, public ElementRef: ElementRef, private checkoutAnalyticsService: CheckoutAnalyticsService) {
		this.dialogs$ = store.select(fromRoot.getDialogs);
		this.payment$ = store.select(fromRoot.getPaymentState);
		this.Content$ = store.select(fromRoot.getGeneralContent);
	}

	ngOnInit() {
		this.store
			.select(fromRoot.getGeneralContent)
			.take(1)
			.subscribe(c => {
				this.PolicyDetailsTellMeMoreInfo = c.PolicyDetailsTellMeMoreInfo;
				this.PolicyDetailsTellMeMoreLabel = c.PolicyDetailsTellMeMoreLabel;
			});

		this.store.dispatch(
			new dialogActions.CreateDialogAction({
				id: this.dialogActionName,
				component: PaymentFrequencyDialogComponent,
				componentInputs: {
					content: this.PolicyDetailsTellMeMoreInfo,
				},
				open: false,
			})
		);

		this.subscriptions.push(
			this.payment$.subscribe(paymentState => {
				this.TwoYearPolicyMessage = paymentState.options ? paymentState.options.TwoYearPolicyMessage : '';
			})
		);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		this.subscriptions = [];
	}

	public OpenDialog(): void {
		this.checkoutAnalyticsService.TrackEvent('FormFieldClicked', { fieldName: 'PolicyDurationTellMeMore' });
		this.store.dispatch(new dialogActions.OpenDialogAction({ id: this.dialogActionName }));
	}
}
