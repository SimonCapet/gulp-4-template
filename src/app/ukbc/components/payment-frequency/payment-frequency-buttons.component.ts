import { Component, ViewEncapsulation, ChangeDetectorRef, OnInit, HostBinding } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import classNames from 'classnames';
import { PaymentFrequency } from 'ukbc/components/payment-frequency/payment-frequency-base';
import { EPurchaseType } from 'ukbc/enums';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-payment-frequency-buttons',
	templateUrl: './payment-frequency-buttons.component.html',
	styleUrls: ['./payment-frequency-buttons.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PaymentFrequencyButtonsComponent extends PaymentFrequency {
	@HostBinding('class.PaymentFrequencyButtons--flex') displayFlex = false;

	constructor(store: Store<fromRoot.State>, cd: ChangeDetectorRef, analyticsService: CheckoutAnalyticsService) {
		super(store, cd, analyticsService, true);
	}

	public get ButtonClassMonthly(): string {
		this.displayFlex = this.MonthlyDiscountedInstallmentFrequencyText !== null;
		return classNames({
			'Btn--green Btn--tick': this.Frequency === EPurchaseType.Monthly,
			'Btn--white Btn--circle': this.Frequency === EPurchaseType.Annual,
			'PaymentFrequencyBtn--wide-monthly': this.MonthlyDiscountedInstallmentFrequencyText,
			'PaymentFrequencyBtn--show-prices': !this.JourneyContent.HidePaymentOptionPrice,
		});
	}

	public get ButtonClassAnnual(): string {
		return classNames({
			'Btn--green Btn--tick': this.Frequency === EPurchaseType.Annual,
			'Btn--white Btn--circle': this.Frequency === EPurchaseType.Monthly,
			'PaymentFrequencyBtn--narrow-annual': this.MonthlyDiscountedInstallmentFrequencyText,
			'PaymentFrequencyBtn--show-prices': !this.JourneyContent.HidePaymentOptionPrice,
		});
	}
}
