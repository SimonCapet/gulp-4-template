import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewEncapsulation,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { IJourneyContent, IProduct, IProductPrices } from 'ukbc/models';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import { State } from 'ukbc/reducers';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { TempProduct } from 'ukbc/containers/summary/summary.component';
import { toPounds } from 'shared/helpers';
import { EPriceType } from 'ukbc/enums';

@Component({
	selector: 'ukbc-summary-product',
	templateUrl: './summary-product.component.html',
	styleUrls: ['summary-product.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SummaryProductComponent implements OnInit, OnChanges {
	@Input() product: IProduct;
	@Input() productSelected = false;
	@Input() undoTimeout: number;
	@Input() addProductButtonCostSuffix: string;
	@Input() productPrices: IProductPrices;
	@Input() comparisonProductPrices: IProductPrices;
	@Input() journeyContent: IJourneyContent;
	@Input() offer: { offerMessage: string; backgroundColour: string | null };

	@Input()
	set setUndoProduct(tempProduct: TempProduct) {
		this.activateUndoProduct = !!tempProduct;
		this.undoBeingAdded = tempProduct ? tempProduct.beingAdded : false;
	}

	@Input() isLastProduct: boolean;
	@Input() availableParentProducts: string[];

	@Output() removeProduct = new EventEmitter();
	@Output() addProduct = new EventEmitter();
	@Output() undoProduct = new EventEmitter();

	public Price: string;
	public ComparisonPrice: string;
	public activateUndoProduct = false;
	public undoBeingAdded = false;
	public EPriceType = EPriceType;
	public CanBeRemoved: boolean;
	public Offer: { offerMessage: string; backgroundColour: string | null };

	constructor(private store: Store<State>, private analyticsService: CheckoutAnalyticsService) {}

	ngOnInit() {
		if (this.product.MoreInfoDescription) {
			this.store.dispatch(
				new dialogActions.CreateDialogAction({
					id: `summary_info_${this.product.ProductCode}`,
					content: this.product.MoreInfoDescription,
					open: false,
				})
			);
		}

		this.CanBeRemoved = !(
			this.availableParentProducts &&
			this.availableParentProducts.includes(this.product.ParentProduct) &&
			this.availableParentProducts.length < 2
		);

		this.Offer = this.offer;
	}

	ngOnChanges(changes: SimpleChanges): void {
		const pricingChanges = changes.productPrices;
		const comparisonChanges = changes.comparisonProductPrices;

		if (
			(pricingChanges && (pricingChanges.firstChange || pricingChanges.previousValue !== pricingChanges.currentValue)) ||
			(comparisonChanges && (comparisonChanges.firstChange || comparisonChanges.previousValue !== comparisonChanges.currentValue))
		) {
			this.onPricingChange();
		}

		this.Offer = this.offer;
	}

	private onPricingChange(): void {
		const productPrice = this.productPrices[this.product.ProductCode];
		const comparisonProductPrice = this.comparisonProductPrices ? this.comparisonProductPrices[this.product.ProductCode] : null;

		this.Price = toPounds(productPrice != null ? productPrice.Diff : null);
		this.ComparisonPrice =
			comparisonProductPrice != null && comparisonProductPrice.Diff != null && comparisonProductPrice.Diff > productPrice.Diff
				? toPounds(comparisonProductPrice.Diff)
				: null;
	}

	public RemoveProduct(): void {
		this.removeProduct.emit();
	}

	public AddProduct(): void {
		this.addProduct.emit();
	}

	public UndoProduct(): void {
		this.undoProduct.emit();
	}

	public ShowMoreInfo(): void {
		this.store.dispatch(
			new dialogActions.OpenDialogAction({
				id: `summary_info_${this.product.ProductCode}`,
			})
		);

		this.analyticsService.TrackEvent('SummaryTellMore', {
			productCode: this.product.ProductCode,
		});
	}
}
