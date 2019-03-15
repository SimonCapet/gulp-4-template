import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { IGeneralContent, IInitialState, IPayment, IPaymentOptions } from 'ukbc/models';
import { EPaymentType, EBaseProductPrefix } from 'ukbc/enums';
import * as paymentActions from 'ukbc/actions/payment.actions';
import * as fromRoot from 'ukbc/reducers';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ukbc-payment-method',
	templateUrl: './method.component.html',
	styleUrls: ['./method.component.scss'],
})
export class PaymentMethodComponent {
	@Input() Content: IGeneralContent;
	@Input() isOpen: boolean;
	@Input() isComplete: boolean;
	@Input() Payment: IPayment;
	@Input() PaymentOptions: IPaymentOptions;
	@Input() AvailablePaymentTypes: EPaymentType[];

	public PaymentType = EPaymentType;

	constructor(private store: Store<fromRoot.State>, private checkoutAnalyticsService: CheckoutAnalyticsService) {}

	public SetPaymentMethod(type: EPaymentType) {
		this.checkoutAnalyticsService.TrackPaymentMethodButtonClicked(type);
		this.store.dispatch(
			new paymentActions.SetPaymentMethodAction({
				paymentType: type,
				directDebitPaymentType: this.Payment.directDebitPaymentType,
			})
		);
	}

	public CreditCardAvailable(): boolean {
		return this.AvailablePaymentTypes.includes(EPaymentType.CreditCard);
	}

	public DebitCardAvailable(): boolean {
		return this.AvailablePaymentTypes.includes(EPaymentType.DebitCard);
	}

	public DirectDebitAvailable(): boolean {
		return this.AvailablePaymentTypes.includes(EPaymentType.DirectDebit);
	}

	public GetPaymentType(): string {
		switch (this.Payment.paymentType) {
			case EPaymentType.DebitCard:
				return this.Content.PaymentByDebitCardLabel;
			case EPaymentType.CreditCard:
				return this.Content.PaymentByCreditCardLabel;
			case EPaymentType.DirectDebit:
				return this.Content.PaymentByDirectDebitLabel;
		}
		return '';
	}
}
