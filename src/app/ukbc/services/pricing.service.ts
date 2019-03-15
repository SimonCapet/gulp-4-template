import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { IPrice, IProduct, IProductPrice, IAPIURLs, IErrorContent } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';

import { HttpService } from 'shared/services';
import { CheckoutAnalyticsService } from 'ukbc/services/checkout-analytics.service';

@Injectable()
export class PricingService {
	private apiUrls: IAPIURLs;
	private errorContent: IErrorContent;
	private pricing$: Observable<IPrice>;
	private initialPricingReceived = false;

	constructor(
		private http: HttpClient,
		private store: Store<fromRoot.State>,
		private httpService: HttpService,
		private checkoutAnalyticsService: CheckoutAnalyticsService
	) {
		store
			.select(fromRoot.getAPIURLs)
			.take(1)
			.map(apiUrls => (this.apiUrls = apiUrls))
			.subscribe();

		store
			.select(fromRoot.getErrorsContent)
			.take(1)
			.map(errorContent => (this.errorContent = errorContent))
			.subscribe();

		this.pricing$ = store.select(fromRoot.getPricing);
	}

	public GetPrices(bitSet, voucherAmount?: number): Promise<any> {
		const url = `${this.apiUrls.PricingApiUrl}`;
		let params = `&selbit=${bitSet}`;
		if (voucherAmount != null) {
			params += `&va=${voucherAmount}`;
		}
		return new Promise((resolve, reject) => {
			return this.httpService
				.get(url, params, {}, false, this.errorContent.GetPricesTimeout)
				.toPromise()
				.then(data => {
					if (!this.initialPricingReceived) {
						this.checkoutAnalyticsService.UpdateInitialPrices({
							annual: data.TotalToPayWithDiscount,
							monthly: data.DiscountedMonthlyAmount > 0 ? data.DiscountedMonthlyAmount : data.MonthlyAmount,
						});
					}
					this.initialPricingReceived = true;
					resolve(data);
				})
				.catch(error => {
					if (!error.handled) {
						reject(error);
					}
				});
		});
	}

	public GetPrice(product: IProduct): Observable<IProductPrice | {}> {
		return this.pricing$
			.map(pricing => {
				return !!pricing.prices && pricing.prices[product.ProductCode] ? pricing.prices[product.ProductCode] : {};
			})
			.share();
	}

	public GetMultiProductPrice(multiProduct: string): Observable<IProductPrice | {}> {
		return this.pricing$
			.map(pricing => {
				return !!pricing.prices && pricing.prices[multiProduct] ? pricing.prices[multiProduct] : {};
			})
			.share();
	}
}
