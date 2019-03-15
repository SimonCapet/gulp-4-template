import { Component, ViewEncapsulation, ChangeDetectorRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';

import { EPurchaseType } from 'ukbc/enums';
import { PaymentFrequency } from 'ukbc/components/payment-frequency/payment-frequency-base';

import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-payment-frequency-toggle',
	templateUrl: './payment-frequency-toggle.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class PaymentFrequencyToggleComponent extends PaymentFrequency {
	@Input() radioColour: string;

	constructor(store: Store<fromRoot.State>, cd: ChangeDetectorRef, analyticsService: CheckoutAnalyticsService) {
		super(store, cd, analyticsService);
	}

	public HandleRadioKeyup(event$: KeyboardEvent): void {
		if (event$.keyCode === 13 || event$.keyCode === 32) {
			event$.preventDefault();
			switch (this.Frequency) {
				case EPurchaseType.Monthly:
					this.ToggleFrequency(EPurchaseType.Annual);
					break;
				case EPurchaseType.Annual:
					this.ToggleFrequency(EPurchaseType.Monthly);
					break;
			}
		}
	}
}
