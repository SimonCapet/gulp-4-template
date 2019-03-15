import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import classNames from 'classnames';
import { PaymentFrequency } from 'ukbc/components/payment-frequency/payment-frequency-base';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { EPolicyDuration } from 'ukbc/enums';

@Component({
	selector: 'ukbc-payment-frequency-duration-buttons',
	templateUrl: './payment-frequency-duration-buttons.component.html',
	styleUrls: ['./payment-frequency-duration-buttons.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PaymentFrequencyDurationButtonsComponent extends PaymentFrequency {
	constructor(store: Store<fromRoot.State>, cd: ChangeDetectorRef, analyticsService: CheckoutAnalyticsService) {
		super(store, cd, analyticsService, true);
	}

	public get ButtonClassOneYear(): string {
		return classNames({
			'Btn--green Btn--tick': this.Duration !== EPolicyDuration.TwoYears,
			'Btn--white Btn--circle': this.Duration === EPolicyDuration.TwoYears,
			'PaymentFrequencyDurationBtn--show-prices': !this.JourneyContent.HidePaymentOptionPrice,
		});
	}

	public get ButtonClassTwoYears(): string {
		return classNames({
			'Btn--green Btn--tick': this.Duration === EPolicyDuration.TwoYears,
			'Btn--white Btn--circle': this.Duration !== EPolicyDuration.TwoYears,
			'PaymentFrequencyDurationBtn--show-prices': !this.JourneyContent.HidePaymentOptionPrice,
		});
	}
}
