import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { EBaseProductPrefix } from 'ukbc/enums/baseProductPrefix.enum';
import { IProduct, IProductBasisValues, IPrice } from 'ukbc/models';

@Component({
	selector: 'ukbc-basket-items',
	templateUrl: './basket-items.component.html',
	styleUrls: ['./basket-items.component.scss'],
})
export class BasketItemsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() historicalProducts$: Observable<IProduct[]>;
	@Input() historicalProductsLength: number;
	@Input() selectedProductCodes$: Observable<string[]>;
	@Input() selectedProducts$: Observable<IProduct[]>;
	@Input() allProducts: IProduct[];
	@Input() showSwitches: boolean;
	@Input() showHistorical: boolean;
	@Input() basisValues: IProductBasisValues;
	@Input() hideBasisItem: boolean;
	@Input() pricing: IPrice;
	@Input() availableParentProducts: string[];
	@Output() addProduct = new EventEmitter<IProduct>();
	@Output() removeProduct = new EventEmitter<IProduct>();
	@Output() scrollBasketToBottom = new EventEmitter<void>();

	public Products: IProduct[];
	public BasisProduct: IProduct;
	public ProductPrefix = EBaseProductPrefix;

	private subscriptions: Subscription[] = [];

	constructor(private elRef: ElementRef) {}

	public ngOnInit(): void {
		this.subscribeToHistoricalProducts();
		this.subscribeToSelectedProducts();
	}

	private subscribeToHistoricalProducts(): void {
		this.subscriptions.push(
			this.historicalProducts$.subscribe(products => {
				this.Products = products.filter(p => !p.HideProductFromUI);
			})
		);
	}

	private subscribeToSelectedProducts(): void {
		this.subscriptions.push(
			this.selectedProducts$.subscribe(products => {
				this.BasisProduct = products.find(p => !!p.ParentProduct);
			})
		);
	}

	public ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	public ngOnChanges(changes: SimpleChanges): void {
		// Scroll to the bottom of the basket if a new product is added to the basket items
		// Or the number of vehicles/people has changed
		if (
			changes.historicalProductsLength &&
			(changes.historicalProductsLength.currentValue > changes.historicalProductsLength.previousValue ||
				(!changes.basisValues.firstChange && changes.basisValues.currentValue !== changes.basisValues.previousValue))
		) {
			this.scrollBasketToBottom.emit();
		}
	}

	public IsProductSelected(product: IProduct): Observable<boolean> {
		return this.selectedProductCodes$.map(codes => codes.includes(product.ProductCode));
	}

	public AddProduct(event: Event, product: IProduct) {
		// setTimeout and prevent event propogation as may not want to update the radio button state on click
		// if a confirmation dialog needs to be displayed
		setTimeout(() => this.addProduct.emit(product));
		event.preventDefault();
	}

	public RemoveProduct(event: Event, product: IProduct) {
		// setTimeout and prevent event propogation as may not want to update the radio button state on click
		// if a confirmation dialog needs to be displayed
		setTimeout(() => this.removeProduct.emit(product));
		event.preventDefault();
	}

	public SetBasis(amount: number): void {
		const productCode = `${this.BasisProduct.ParentProduct}${amount}`;
		const product = this.allProducts.find(p => p.ProductCode === productCode);

		this.addProduct.emit(product);
	}

	public CanBeToggled(product: IProduct): boolean {
		// A product cannot be toggled if it's the only product associated with the available parent products,
		// e.g. PBM products cannot be disabled on PBM-only journeys
		return !(this.availableParentProducts.includes(product.ParentProduct) && this.availableParentProducts.length < 2);
	}
}
