import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { IJourneyContent, IPrice } from 'ukbc/models';
import { timer } from 'rxjs/observable/timer';
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operators';
import { toPounds } from 'shared/helpers';

@Component({
	selector: 'ukbc-basket-price',
	templateUrl: './basket-price.component.html',
	styleUrls: ['./basket-price.component.scss'],
})
export class BasketPriceComponent implements OnInit {
	@Input() pricing$: Observable<IPrice>;
	@Input() journeyContent: IJourneyContent;

	public Price: string;
	public PriceLoading = true;
	public AnimatePrice = false;

	constructor(private cd: ChangeDetectorRef) {}

	ngOnInit() {
		this.pricing$.pipe(filter(price => price.total !== null)).subscribe(price => {
			this.PriceLoading = price.receiving;
			this.Price = toPounds(price.total, false, this.journeyContent.AllowPaymentByEagleEyeTokens);
			this.cd.markForCheck();
			// Wait 50 millis before initiating the animation, this is because
			// if we go straight away the animation isn't visible as the element
			// isn't in the dom yet.
			timer(50).subscribe(() => {
				this.AnimatePrice = true;
				this.cd.markForCheck();
			});
		});
	}
}
