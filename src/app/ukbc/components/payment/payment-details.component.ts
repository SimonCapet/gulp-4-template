import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/take';

import { IGeneralContent, IPaymentState } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';
import { ContentService } from 'ukbc/services/content.service';
import { EPaymentType } from 'ukbc/enums';

@Component({
	selector: 'ukbc-payment-details',
	templateUrl: './payment-details.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class PaymentDetailsComponent implements OnInit {
	public Content$: Observable<IGeneralContent>;
	public Content: IGeneralContent;
	public Payment$: Observable<IPaymentState>;
	public PaymentType: EPaymentType;

	constructor(private store: Store<fromRoot.State>, public contentService: ContentService) {
		this.Content$ = store.select(fromRoot.getGeneralContent);
		this.Payment$ = store.select(fromRoot.getPaymentState);
	}

	ngOnInit() {
		this.Payment$
			.take(1)
			.subscribe(payment => (this.PaymentType = <EPaymentType>this.convertPascalToSentence(payment.payment.model.paymentType)));
		this.Content$.take(1).subscribe(content => (this.Content = content));
	}

	private convertPascalToSentence(string: string): string {
		return string.replace(/([A-Z])/g, ' $1').trim();
	}
}
