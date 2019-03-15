import { Component, ChangeDetectorRef } from '@angular/core';
import { PaymentFrequency } from 'ukbc/components/payment-frequency/payment-frequency-base';
import { Store } from '@ngrx/store';

import * as fromRoot from 'ukbc/reducers';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-payment-frequency-radio-buttons',
	templateUrl: 'payment-frequency-radio-buttons.component.html',
})
export class PaymentFrequencyRadioButtonsComponent extends PaymentFrequency {
	constructor(store: Store<fromRoot.State>, cd: ChangeDetectorRef, analyticsService: CheckoutAnalyticsService) {
		super(store, cd, analyticsService);
	}
}
