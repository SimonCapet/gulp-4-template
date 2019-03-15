import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	OnDestroy,
	ChangeDetectorRef,
	ViewChild,
	ElementRef,
	Input,
	OnChanges,
	SimpleChange,
	SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/share';
import classNames from 'classnames';
import { PreventOverScrolling } from 'prevent-overscrolling';

import * as fromRoot from 'ukbc/reducers';
import * as productActions from 'ukbc/actions/product.actions';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import * as layoutActions from 'ukbc/actions/layout.actions';
import { CheckoutAnalyticsService, ViewportService } from 'ukbc/services';

import { IProduct, IPrice, IStep, IGeneralContent, IProductBasisValues, IJourneyContent, IEagleEyeState } from 'ukbc/models';
import { GetViewportDetails } from 'viewport-details';
import { CONFIG } from 'ukbc/config';
import { debounce } from 'scripts/utils';
import { EProductSelectionSource, EPurchaseType } from 'ukbc/enums';
import { replaceEagleEyeTokenValuePlaceholder } from 'ukbc/helpers/placeholderReplacement.helper';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import { ScrollTo } from 'scroll-to-position';
import { withLatestFrom, map } from 'rxjs/operators';
import { toPounds } from 'shared/helpers';

const MIN_MAX_HEIGHT_VALUE = 140;
const MAX_HEIGHT_OFFSET_DESKTOP = 30;
const EXTRA_MAX_HEIGHT_OFFSET_LIVE_CHAT = 40;
const EAGLE_EYE_HEADER_HEIGHT_DESKTOP = 90; // Ensure this is kept in sync with $eagle-eye-header-height-desktop in `_ukbc-settings.scss`

@Component({
	selector: 'ukbc-basket',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './basket.component.html',
	styleUrls: ['./basket.component.scss'],
})
export class BasketComponent implements OnInit, OnDestroy, OnChanges {
	@Input() currentStep: IStep;
	@ViewChild('basket') basket: ElementRef;
	@ViewChild('itemsContainer') itemsContainer: ElementRef;

	private subscriptions: Subscription[] = [];
	private itemsCountAnimationTimeout: NodeJS.Timer | number;
	private animateItemsCount: boolean;
	private previousPrice: number;
	private priceAnimationTimeout: NodeJS.Timer | number;
	private animatePricing: boolean;
	private basketOpen = false;
	private basketItemsDisplay = false;
	private basketHidden = false;
	private initialised = false;
	private selectedProducts$: Observable<IProduct[]>;
	private basketHidden$: Observable<boolean>;
	private frequency$: Observable<EPurchaseType>;

	private debouncedSetItemsHeight = debounce(this.setBasketItemsHeight.bind(this), 300);

	public SelectedProductCodes$: Observable<string[]>;
	public SelectedProducts$: Observable<IProduct[]>;
	public HistoricalProducts$: Observable<IProduct[]>;
	public AllProducts: IProduct[];
	public Pricing$: Observable<IPrice>;
	public BasketOpen$: Observable<boolean>;
	public BasisItemHidden$: Observable<boolean>;
	public Step$: Observable<IStep>;
	public NumberOfSelectedProducts: number;
	public Content$: Observable<IGeneralContent>;
	public JourneyContent$: Observable<IJourneyContent>;
	public ItemsContainerMaxHeight: string;
	public BasisValues$: Observable<IProductBasisValues>;
	public AvailableParentProducts$: Observable<string[]>;
	public Classes: string;
	public AllowPaymentByEagleEyeTokens = false;
	public EagleEyeState$: Observable<IEagleEyeState>;
	public ComparisonPriceSaving$: Observable<string>;
	public PricePrefix$: Observable<string>;
	public PriceSuffix$: Observable<string>;
	public IsMonthly: boolean;

	constructor(
		public ElementRef: ElementRef,
		private store: Store<fromRoot.State>,
		private checkoutAnalyticsService: CheckoutAnalyticsService,
		private cd: ChangeDetectorRef,
		private viewportService: ViewportService
	) {
		this.selectedProducts$ = store.select(fromRoot.getSelectedProducts);
		this.SelectedProductCodes$ = store.select(fromRoot.getSelectedProductCodes);
		this.SelectedProducts$ = store.select(fromRoot.getSelectedProducts);
		this.HistoricalProducts$ = store.select(fromRoot.getHistoricalProducts);
		this.Pricing$ = store.select(fromRoot.getPricing);
		this.BasketOpen$ = store.select(fromRoot.getBasketOpen);
		this.BasisItemHidden$ = store.select(fromRoot.getBasketBasisItemHidden);
		this.basketHidden$ = store.select(fromRoot.getBasketHidden);
		this.Content$ = store.select(fromRoot.getGeneralContent);
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
		this.Step$ = store.select(fromRoot.getCurrentStep);
		this.BasisValues$ = store.select(fromRoot.getBasisValues);
		this.AvailableParentProducts$ = store.select(fromRoot.getAvailableParentProducts);
		this.EagleEyeState$ = store.select(fromRoot.getEagleEyeState);
		this.PricePrefix$ = store.select(fromRoot.getPricePrefix);
		this.PriceSuffix$ = store.select(fromRoot.getPriceSuffix);
		this.frequency$ = store.select(fromRoot.getFrequency);

		this.ComparisonPriceSaving$ = this.Pricing$.pipe(
			withLatestFrom(
				this.JourneyContent$,
				store.select(fromRoot.getFrequency),
				(pricing: IPrice, journeyContent: IJourneyContent, frequency: EPurchaseType) => ({ pricing, journeyContent, frequency })
			),
			map(({ pricing, journeyContent, frequency }: { pricing: IPrice; journeyContent: IJourneyContent; frequency: EPurchaseType }) => {
				const saving = pricing.comparisonTotal - pricing.total;
				if (!journeyContent.UseComparisonPrice || saving <= 0) {
					return null;
				}
				const message =
					frequency === EPurchaseType.Annual ? journeyContent.AnnualComparisonBasketMessage : journeyContent.MonthlyComparisonBasketMessage;
				return message.replace('{saving}', toPounds(saving));
			})
		);
	}

	public ngOnInit(): void {
		this.getAllProducts();
		this.subscribeToViewportDetails();
		this.initialisePricing();
		this.subscribeToBasketOpen();
		this.subscribeToBasketHidden();
		this.subscribeToSelectedProducts();
		this.subscribeToAllowPaymentByEagleEyeTokens();
		this.subscribeToFrequency();

		PreventOverScrolling(this.itemsContainer.nativeElement);

		setTimeout(() => {
			this.initialised = true;
			this.setClasses();
		});

		this.createDialogs();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		this.handleStepChanges(changes.currentStep);
	}

	public ngOnDestroy(): void {
		this.subscriptions.forEach(s => s.unsubscribe());
	}

	private initialisePricing(): void {
		this.subscriptions.push(
			this.Pricing$.subscribe(pricing => {
				if (!pricing.received && !pricing.receiving) {
					this.store.dispatch(new pricingActions.GetPricesAction());
				}

				if (this.previousPrice !== pricing.total) {
					clearTimeout(<number>this.priceAnimationTimeout);

					this.animatePricing = true;
					this.setClasses();

					setTimeout(() => {
						this.animatePricing = false;
						this.setClasses();
						this.cd.markForCheck();
					}, 2000);
				}

				this.previousPrice = pricing.total;
			})
		);
	}

	private subscribeToBasketOpen(): void {
		this.subscriptions.push(
			this.BasketOpen$.subscribe(open => {
				/* If basket open is changing from closed to open add display class and then after 10ms add the open class to animate.
					 If basket open is changing from open to closed remove open class, wait for animation to finish and then remove display class. */
				setTimeout(() => {
					this.basketItemsDisplay = open;
					this.setClasses();
				}, open ? 0 : CONFIG.ANIMATION_FAST_DURATION);

				setTimeout(() => {
					this.basketOpen = open;
					this.setClasses();
				}, open ? 10 : 0);

				if (open) {
					this.debouncedSetItemsHeight();
				}
			})
		);
	}

	private subscribeToBasketHidden(): void {
		this.subscriptions.push(
			this.basketHidden$.subscribe(b => {
				this.basketHidden = b;
				this.setClasses();
			})
		);
	}

	private subscribeToSelectedProducts(): void {
		this.subscriptions.push(
			this.selectedProducts$.subscribe(products => {
				const numberOfProducts = products.filter(p => !p.HideProductFromUI).length;

				if (this.NumberOfSelectedProducts && numberOfProducts !== this.NumberOfSelectedProducts) {
					clearTimeout(<number>this.itemsCountAnimationTimeout);

					this.animateItemsCount = true;
					this.setClasses();

					this.itemsCountAnimationTimeout = setTimeout(() => {
						this.animateItemsCount = false;
						this.setClasses();
						this.cd.markForCheck();
					}, 2000);
				}

				if (numberOfProducts !== this.NumberOfSelectedProducts) {
					setTimeout(this.setBasketItemsHeight.bind(this), 0);
				}

				this.NumberOfSelectedProducts = numberOfProducts;
			})
		);
	}

	private subscribeToViewportDetails(): void {
		this.subscriptions.push(
			this.viewportService.ViewportDetails.subscribe(v => {
				if (v.resized) {
					this.debouncedSetItemsHeight();
				}
			})
		);
	}

	private subscribeToAllowPaymentByEagleEyeTokens(): void {
		this.subscriptions.push(this.JourneyContent$.subscribe(c => (this.AllowPaymentByEagleEyeTokens = c.AllowPaymentByEagleEyeTokens)));
	}

	private subscribeToFrequency(): void {
		this.subscriptions.push(this.frequency$.subscribe(f => (this.IsMonthly = f === EPurchaseType.Monthly)));
	}

	private getAllProducts(): void {
		this.store
			.select(fromRoot.getAllProducts)
			.take(1)
			.subscribe(p => (this.AllProducts = p));
	}

	private setBasketItemsHeight(): void {
		const viewportDetails = GetViewportDetails();
		const itemsRect = this.itemsContainer.nativeElement.getBoundingClientRect();

		let viewportBottomWithOffset = viewportDetails.height;

		if (viewportDetails.width > CONFIG.MOBILE_BREAKPOINT) {
			viewportBottomWithOffset -= MAX_HEIGHT_OFFSET_DESKTOP;
		}

		if (this.currentStep && this.currentStep.data.ShowLiveChat) {
			viewportBottomWithOffset -= EXTRA_MAX_HEIGHT_OFFSET_LIVE_CHAT;
		}

		const minMaxHeightValue = this.AllowPaymentByEagleEyeTokens
			? MIN_MAX_HEIGHT_VALUE - EAGLE_EYE_HEADER_HEIGHT_DESKTOP
			: MIN_MAX_HEIGHT_VALUE;

		this.ItemsContainerMaxHeight =
			viewportDetails.width <= CONFIG.MOBILE_BREAKPOINT
				? `calc(100vh - ${itemsRect.top}px)`
				: `${Math.max(viewportBottomWithOffset - itemsRect.top, minMaxHeightValue)}px`;

		this.cd.markForCheck();
	}

	private handleStepChanges(change: SimpleChange): void {
		if (!change.previousValue || change.previousValue.url !== change.currentValue.url) {
			this.setBasketItemsHeight();
		}
	}

	public AddProduct(product: IProduct): void {
		this.checkoutAnalyticsService.TrackProductsAdded([product], EProductSelectionSource.Basket);
		this.store.dispatch(
			new productActions.BeginSelectProductAction({ productCodes: [product.ProductCode], source: EProductSelectionSource.Basket })
		);
	}

	public RemoveProduct(product: IProduct): void {
		this.checkoutAnalyticsService.TrackProductsRemoved([product], EProductSelectionSource.Basket);
		this.store.dispatch(
			new productActions.BeginDeselectProductAction({ productCodes: [product.ProductCode], source: EProductSelectionSource.Basket })
		);
	}

	public ToggleBasket(event: MouseEvent) {
		if (!['INPUT', 'LABEL'].includes((<HTMLElement>event.target).tagName)) {
			this.store.dispatch(new layoutActions.ToggleBasketOpenAction());
		}
	}

	private setClasses(): void {
		this.Classes = classNames({
			'Basket--items-updated': this.animateItemsCount,
			'Basket--prices-updated': this.animatePricing,
			'Basket--items-display': this.basketItemsDisplay,
			'Basket--open': this.basketOpen,
			'Basket--hide': this.basketHidden,
			'Basket--initialised': this.initialised,
			'Basket--eagle-eye-tokens': this.AllowPaymentByEagleEyeTokens,
		});

		this.cd.markForCheck();
	}

	public GetEagleEyeTokenHeaderState(journeyContent: IJourneyContent, eagleEyeTokenState: IEagleEyeState): string {
		return !eagleEyeTokenState.tokenValue
			? journeyContent.EagleEyeTokensNotAppliedText
			: replaceEagleEyeTokenValuePlaceholder(journeyContent.EagleEyeTokensAppliedText, eagleEyeTokenState.tokenValue);
	}

	private createDialogs(): void {
		this.JourneyContent$.take(1).subscribe(c => {
			if (c.AllowPaymentByEagleEyeTokens && c.EagleEyeTokensPartPayModalContent) {
				this.store.dispatch(
					new dialogActions.CreateDialogAction({
						id: 'eagle-eye-part-pay-info',
						content: c.EagleEyeTokensPartPayModalContent,
						open: false,
					})
				);
			}
			if (c.BasketPricesModalTrigger && c.BasketPricesModalContent) {
				this.store.dispatch(
					new dialogActions.CreateDialogAction({
						id: 'basket-prices-info',
						content: c.BasketPricesModalContent,
						open: false,
					})
				);
			}
		});
	}

	public OpenPartPayInfoDialog() {
		this.store.dispatch(new dialogActions.OpenDialogAction({ id: 'eagle-eye-part-pay-info' }));
	}

	public OpenBasketPricesDialog() {
		this.store.dispatch(new dialogActions.OpenDialogAction({ id: 'basket-prices-info' }));
	}

	public onScrollBasketToBottom(): void {
		setTimeout(() => {
			ScrollTo([0, this.itemsContainer.nativeElement.scrollHeight], {
				scrollContainer: this.itemsContainer.nativeElement,
			});
		}, 100);
	}
}
