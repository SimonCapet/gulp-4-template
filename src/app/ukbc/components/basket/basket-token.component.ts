import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators';

import { IPrice, IJourneyContent } from 'ukbc/models';
import { toPounds } from 'shared/helpers';

@Component({
	selector: 'ukbc-basket-token',
	templateUrl: './basket-token.component.html',
	styleUrls: ['./basket-token.component.scss'],
})
export class BasketTokenComponent implements OnInit {
	@Input() pricing$: Observable<IPrice>;
	@Input() journeyContent: IJourneyContent;
	@Input() eagleEyeTokenValue?: number;

	public RACPrice: string;
	public TokensEquivalentValue: string;

	ngOnInit() {
		this.pricing$.pipe(filter(price => price.total !== null)).subscribe(price => {
			this.RACPrice = toPounds(price.totalWithoutDiscount, false, true);
			this.TokensEquivalentValue = toPounds(price.totalToPayUsingEagleEyeVouchers, false, true);
		});
	}
}
