import { Component, Input, ViewEncapsulation } from '@angular/core';
import { IJourneyContent } from 'ukbc/models';
import { EPriceType } from 'ukbc/enums';

@Component({
	selector: 'ukbc-product-price',
	templateUrl: './price.component.html',
	styleUrls: ['price.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PriceComponent {
	@Input() price: string;
	@Input() comparisonPrice: string | null;
	@Input() priceSuffix: string | null;
	@Input() journeyContent: IJourneyContent;

	public get ShowComparisonPrice(): boolean {
		return this.journeyContent.UseComparisonPrice && this.comparisonPrice !== null && this.price !== this.comparisonPrice;
	}

	public get CurrentPriceSuffix(): string {
		return this.price && this.price !== EPriceType.Free ? this.priceSuffix : '';
	}

	public get ComparisonPriceSuffix(): string {
		return this.comparisonPrice && this.comparisonPrice !== EPriceType.Free ? this.priceSuffix : '';
	}
}
