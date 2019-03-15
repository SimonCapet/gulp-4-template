import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/combineLatest';
import * as fromRoot from 'ukbc/reducers';
import { IPrice, IGeneralContent } from 'ukbc/models';
import { EPurchaseType } from 'ukbc/enums';

export interface IPriceLabel {
	productPriceLabel: string;
	basketPriceLabel: string;
}

@Injectable()
export class ContentService {
	private pricing$: Observable<IPrice>;
	private content$: Observable<IGeneralContent>;

	constructor(private store: Store<fromRoot.State>) {
		this.pricing$ = store.select(fromRoot.getPricing);
		this.content$ = store.select(fromRoot.getGeneralContent);
	}

	public getPriceLabel(): Observable<IPriceLabel | {}> {
		return this.pricing$
			.combineLatest(this.content$)
			.map(([pricing, content]) => {
				switch (pricing.frequency) {
					case EPurchaseType.Monthly:
						return {
							basketPriceLabel: content.MonthlyLabel,
							productPriceLabel: content.ProductMonthlyLabel,
						};
					case EPurchaseType.Annual:
						return {
							basketPriceLabel: content.AnnualLabel,
							productPriceLabel: content.ProductAnnualLabel,
						};
					default:
						return {};
				}
			})
			.share();
	}
}
