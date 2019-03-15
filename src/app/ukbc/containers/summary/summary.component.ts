import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IInitialState, IGeneralContent, IProduct, IFaq, IProductPrices, IStep, IJourneyContent, IEagleEyeState } from 'ukbc/models';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { sortBy } from 'sort-by-typescript';

import * as fromRoot from 'ukbc/reducers';
import * as productActions from 'ukbc/actions/product.actions';
import { EBaseProductPrefix, EProductSelectionSource } from 'ukbc/enums';
import { ActivateNextStep, SetCurrentStepCompleted } from 'ukbc/actions/step.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import { ExchangeEagleEyeTokensDialogComponent } from 'ukbc/containers/eagle-eye-token/exchange-eagle-eye-tokens-dialog.component';
import { OfferService } from 'ukbc/services';

export interface TempProduct {
	product: IProduct;
	productTimeout: any;
	animationTimeout: any;
	beingAdded: boolean;
}

@Component({
	selector: 'ukbc-summary',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './summary.component.html',
	styleUrls: ['summary.component.scss'],
	animations: [
		trigger('removeProduct', [
			// When state is 'show' then set height as height of element and opacity to 1
			state('show', style({ height: '*', opacity: 1 })),
			// Inverse of above
			state('hide', style({ height: '0', opacity: 0 })),
			// When we transition states; animate to the new style values
			transition('show => hide', [animate('.2s ease-in-out', style({ height: 0, opacity: 0 }))]),
			transition('hide => show', [animate('.2s ease-in-out', style({ height: '*', opacity: 1 }))]),
		]),
	],
})
export class SummaryComponent implements OnInit, OnDestroy {
	public Content$: Observable<IInitialState>;
	public GlobalContent$: Observable<IGeneralContent>;
	public CurrentStep$: Observable<IStep>;
	public StepTitle: string;
	public StepSubtitle: string;
	public IsDeepLinking: boolean;
	public IncludedProducts: IProduct[] = [];
	public AvailableProducts: IProduct[] = [];
	public UndoTimeout = 3000;
	public PreviousSelectedProducts: IProduct[];
	public Faqs: IFaq[];
	public ExpandedFaqs = false;
	public FaqsTitle: string;
	public ProductPrices$: Observable<IProductPrices>;
	public ComparisonProductPrices$: Observable<IProductPrices>;
	public animationTriggerObject = {};
	public JourneyContent$: Observable<IJourneyContent>;
	public AddProductButtonPriceSuffix$: Observable<string>;
	public EagleEyeState$: Observable<IEagleEyeState>;
	public AvailableParentProducts$: Observable<string[]>;

	private selectedProducts$: Observable<IProduct[]>;
	private allProducts$: Observable<IProduct[]>;
	private allProducts: IProduct[];
	private tempProducts: TempProduct[] = [];
	private subscriptionArray: Subscription[];
	private baseRemovedProduct: IProduct;
	private animationTime = 180;
	private showProduct = 'show';
	private hideProduct = 'hide';
	private WelcomeBackText: string;

	constructor(private store: Store<fromRoot.State>, private cd: ChangeDetectorRef, public OfferService: OfferService) {
		this.Content$ = store.select(fromRoot.getContent);
		this.GlobalContent$ = store.select(fromRoot.getGeneralContent);
		this.selectedProducts$ = store.select(fromRoot.getSelectedProducts);
		this.allProducts$ = store.select(fromRoot.getAllProducts);
		this.ProductPrices$ = store.select(fromRoot.getItemPrices);
		this.ComparisonProductPrices$ = store.select(fromRoot.getComparisonPrices);
		this.CurrentStep$ = store.select(fromRoot.getCurrentStep);
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
		this.AddProductButtonPriceSuffix$ = store.select(fromRoot.getAddProductButtonPriceSuffix);
		this.EagleEyeState$ = store.select(fromRoot.getEagleEyeState);
		this.AvailableParentProducts$ = store.select(fromRoot.getAvailableParentProducts);
	}

	ngOnInit() {
		this.subscriptionArray = [
			this.allProducts$.subscribe((allProducts: IProduct[]) => (this.allProducts = allProducts)),
			this.GlobalContent$.subscribe((generalContent: IGeneralContent) => {
				this.UndoTimeout = generalContent.SelectedProductUndoTimeout ? generalContent.SelectedProductUndoTimeout : this.UndoTimeout;
			}),
			this.JourneyContent$.subscribe((journeyContent: IJourneyContent) => {
				this.Faqs = journeyContent.Faqs;
				this.FaqsTitle = journeyContent.FaqsTitle;
				this.WelcomeBackText = journeyContent.WelcomeBackText;
			}),
			this.selectedProductsSubscription(),
			this.store.select(fromRoot.getCurrentStep).subscribe(currentStep => {
				this.StepTitle = currentStep.data.Title;
				this.StepSubtitle = currentStep.data.Subtitle;
			}),
			this.Content$.subscribe(content => {
				if(content.IsDeepLinking) {
					this.StepTitle = this.WelcomeBackText;
				}
			}),
		];
		this.createExchangeEagleEyeTokensDialog();
	}

	ngOnDestroy() {
		this.subscriptionArray.forEach(sub => sub.unsubscribe());
	}

	public AddProduct(product: IProduct): void {
		this.store.dispatch(
			new productActions.BeginSelectProductAction({
				productCodes: [product.ProductCode],
				source: EProductSelectionSource.Summary,
			})
		);
	}

	public UndoProduct(product: IProduct, beingAdded: boolean): void {
		if (beingAdded) {
			this.store.dispatch(
				new productActions.BeginDeselectProductAction({
					productCodes: [product.ProductCode],
					source: EProductSelectionSource.Summary,
				})
			);
		} else {
			this.store.dispatch(
				new productActions.BeginSelectProductAction({
					productCodes: [product.ProductCode],
					source: EProductSelectionSource.Summary,
				})
			);
		}
	}

	public RemoveProduct(product: IProduct): void {
		this.store.dispatch(
			new productActions.BeginDeselectProductAction({
				productCodes: [product.ProductCode],
				source: EProductSelectionSource.Summary,
			})
		);
	}

	public CompleteStep(): void {
		this.store.dispatch(new SetCurrentStepCompleted());
		this.store.dispatch(new ActivateNextStep());
	}

	private selectedProductsSubscription(): Subscription {
		return this.selectedProducts$.subscribe((selectedProducts: IProduct[]) => {
			if (!this.IncludedProducts.length) {
				// When we first initialise, the IncludedProducts will be empty so
				// set it equal to the selected products minus the hidden from UI products.
				this.IncludedProducts = selectedProducts.filter(selected => !selected.HideProductFromUI).sort(sortBy('SortOrder'));

				// Updated available products
				this.AvailableProducts = this.availableProductsFromAll(selectedProducts).sort(sortBy('SortOrder'));

				// Remove sibling products from available products.
				// this includes seleected products which have siblings
				// that are not selected.
				this.removeAvailableSiblingProducts();
			} else {
				// Remove items hidden from UI.
				selectedProducts = selectedProducts.filter(selected => !selected.HideProductFromUI);
				// -----------------------------------------------------------------
				// Adding Products
				// Get added products and update the added products array.
				// -----------------------------------------------------------------
				const addedProducts: IProduct[] = this.productsAdded(selectedProducts);
				addedProducts.forEach(addedProduct => {
					// Check if the product added is a sibling of a currently selected product
					// i.e. PBM2/VBM2.
					const siblingProductSelected = this.checkIfParentProductSelectedIndex(addedProduct);

					// Add product to included, if it's a sibling then replace the product that exists.
					if (siblingProductSelected === -1) {
						this.addToIncludedProducts(addedProduct);
						this.startProductUpdateTimeout(addedProduct, true);
					} else {
						this.IncludedProducts[siblingProductSelected] = addedProduct;
						this.cd.markForCheck();
					}
				});
				// -----------------------------------------------------------------
				// Removing Products
				// Find removed products that aren't currently in a state of flux.
				// -----------------------------------------------------------------
				const removedProducts: IProduct[] = this.productsRemoved(selectedProducts);
				removedProducts.forEach(removedProduct => {
					const siblingProductRemoved = this.checkIfParentProductSelected(removedProduct);

					if (siblingProductRemoved) {
						// Get base product code name.
						const parentCode = siblingProductRemoved.ParentProduct;
						// Get lowest increment of the base product.
						this.baseRemovedProduct = this.findProduct(`${parentCode}1`);
					}

					if (this.checkIsTempProduct(removedProduct, true)) {
						this.cancelProductTimeout(removedProduct, true);
					} else {
						// If a sibling is removed then set the product to ad back to available as the
						// lowest increment of the product.
						siblingProductRemoved ? this.addToAvailableProducts(this.baseRemovedProduct) : this.addToAvailableProducts(removedProduct);
						this.startProductUpdateTimeout(removedProduct, false);
					}
				});

				// This mops up any cases where a user adds a product then toggle it off in the basket.
				this.selectedProductsAdded(selectedProducts)
					.filter(selected => {
						return !removedProducts.find(removed => removed.ProductCode === selected.ProductCode);
					})
					.forEach(added => {
						this.cancelProductTimeout(added, false);
					});
			}
			// Keep record of previous selected items for comparison.
			this.PreviousSelectedProducts = selectedProducts;
		});
	}

	private productsRemoved(selectedProducts: IProduct[]): IProduct[] {
		return this.IncludedProducts.filter(added => {
			return !selectedProducts.find(selected => selected.ProductCode === added.ProductCode) && !this.checkIsTempProduct(added, false);
		});
	}

	private productsAdded(selectedProducts: IProduct[]): IProduct[] {
		return selectedProducts.filter(selected => {
			return !this.IncludedProducts.find(added => added.ProductCode === selected.ProductCode);
		});
	}

	private selectedProductsAdded(selectedProducts: IProduct[]): IProduct[] {
		return selectedProducts.filter(selected => {
			return !this.PreviousSelectedProducts.find(previous => previous.ProductCode === selected.ProductCode);
		});
	}

	private availableProductsFromAll(selectedProducts: IProduct[]): IProduct[] {
		return this.allProducts.filter(allProduct => {
			return !selectedProducts.find(selected => selected.ProductCode === allProduct.ProductCode) && !allProduct.HideProductFromUI;
		});
	}

	private startProductUpdateTimeout(product: IProduct, beingAdded: boolean): void {
		// Create timeout to remove product and add the timeout
		// to the removed product array so it can be cancelled if needed.
		const productTimeout = setTimeout(() => {
			// Depending on if it's add or remove, choose where to remove it
			// from.
			if (beingAdded) {
				this.removeFromAvailable(product);
			} else {
				this.removeFromIncluded(product);
			}
			this.removeFromTempProducts(product);

			this.cd.markForCheck();
		}, this.UndoTimeout);

		// Set starting value for animation.
		if (beingAdded) {
			this.animationTriggerObject[`add_${product.ProductCode}`] = this.showProduct;
		} else {
			this.animationTriggerObject[`remove_${product.ProductCode}`] = this.showProduct;
		}
		// Create timeout to show animation after [defined amount] millis before we remove
		// it from the dom.
		const animationTimeout = setTimeout(() => {
			if (beingAdded) {
				this.animationTriggerObject[`add_${product.ProductCode}`] = this.hideProduct;
			} else {
				this.animationTriggerObject[`remove_${product.ProductCode}`] = this.hideProduct;
			}

			// Put this in a timeout so the element isn't removed before we animate.
			setTimeout(() => {
				this.removeAnimationTrigger(product.ProductCode);
			});

			this.cd.markForCheck();
		}, this.UndoTimeout - this.animationTime);

		this.tempProducts.push({
			product,
			productTimeout,
			animationTimeout,
			beingAdded,
		});
		this.cd.markForCheck();
	}

	private removeFromIncluded(product: IProduct): void {
		this.IncludedProducts = this.IncludedProducts
			.filter(includedProduct => includedProduct.ProductCode !== product.ProductCode)
			.sort(sortBy('SortOrder'));
	}

	private removeFromAvailable(product: IProduct): void {
		this.AvailableProducts = this.AvailableProducts
			.filter(availProduct => availProduct.ProductCode !== product.ProductCode)
			.sort(sortBy('SortOrder'));
	}

	private checkIsTempProduct(product: IProduct, beingAdded: boolean): TempProduct {
		return this.tempProducts.find(
			tempProduct => tempProduct.product.ProductCode === product.ProductCode && tempProduct.beingAdded === beingAdded
		);
	}

	private cancelProductTimeout(product: IProduct, beingAdded: boolean): void {
		const cancelTimeoutProduct = this.tempProducts.filter(
			tempProduct => tempProduct.product.ProductCode === product.ProductCode && tempProduct.beingAdded === beingAdded
		);
		if (cancelTimeoutProduct.length) {
			cancelTimeoutProduct.forEach(cancelProduct => {
				clearTimeout(cancelProduct.productTimeout);
				clearTimeout(cancelProduct.animationTimeout);
			});
			if (beingAdded) {
				this.removeFromIncluded(product);
			} else {
				this.removeFromAvailable(product);
			}
			this.removeFromTempProducts(product);
			this.cd.markForCheck();
		}
	}

	private addToIncludedProducts(product: IProduct): void {
		this.IncludedProducts = [...this.IncludedProducts, product].sort(sortBy('SortOrder'));
		this.cd.markForCheck();
	}

	private addToAvailableProducts(product: IProduct): void {
		this.AvailableProducts = [...this.AvailableProducts, product].sort(sortBy('SortOrder'));
		this.cd.markForCheck();
	}

	private removeFromTempProducts(product: IProduct): void {
		this.tempProducts = this.tempProducts.filter(tempProduct => tempProduct.product.ProductCode !== product.ProductCode);
	}

	private checkIfParentProductSelectedIndex(product: IProduct): number {
		return this.IncludedProducts.findIndex(included => product.ParentProduct !== '' && included.ParentProduct === product.ParentProduct);
	}

	private checkIfParentProductSelected(product: IProduct): IProduct {
		return this.IncludedProducts.find(included => product.ParentProduct !== '' && included.ParentProduct === product.ParentProduct);
	}

	private removeAvailableSiblingProducts() {
		// Filter products to keep product who's product code is PBM1 or VBM1 OR
		// who's parent product is blank.
		// Finally check in the included products to see if the product has a sibling that
		// is already selected (has same parent code) and if so then filter the product out too.
		this.AvailableProducts = this.AvailableProducts.filter(removeSibling => {
			return (
				(removeSibling.ProductCode === `${EBaseProductPrefix.PBM}1` ||
					removeSibling.ProductCode === `${EBaseProductPrefix.VBM}1` ||
					removeSibling.ParentProduct === '') &&
				!this.IncludedProducts.find(
					includedProduct => removeSibling.ParentProduct !== '' && includedProduct.ParentProduct === removeSibling.ParentProduct
				)
			);
		});
	}

	private findProduct(productCode: string) {
		return this.allProducts.find(product => product.ProductCode === productCode);
	}

	private removeAnimationTrigger(productCode) {
		Object.keys(this.animationTriggerObject).forEach(key => {
			if (key.includes(productCode)) {
				delete this.animationTriggerObject[key];
			}
		});
	}

	private createExchangeEagleEyeTokensDialog() {
		this.JourneyContent$.take(1).subscribe(content => {
			if (content.ExchangeEagleEyeTokensModalContent) {
				this.store.dispatch(
					new dialogActions.CreateDialogAction({
						id: 'exchange-eagle-eye-tokens',
						component: ExchangeEagleEyeTokensDialogComponent,
						open: false,
					})
				);
			}
		});
	}

	public OpenExchangeEagleEyeTokensDialog() {
		this.store.dispatch(new dialogActions.OpenDialogAction({ id: 'exchange-eagle-eye-tokens' }));
	}
}
