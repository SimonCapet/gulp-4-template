import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import 'rxjs/add/observable/fromPromise';
import { take } from 'rxjs/operators';

import * as fromRoot from 'ukbc/reducers';
import * as productActions from 'ukbc/actions/product.actions';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import * as contactActions from 'ukbc/actions/contact.actions';
import * as vehicleActions from 'ukbc/actions/vehicle.actions';
import * as paymentActions from 'ukbc/actions/payment.actions';
import * as cardActions from 'ukbc/actions/card.actions';
import * as questionActions from 'ukbc/actions/question.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';

import { EBaseProductPrefix, ECardCategory, EDetailsCardType, EPurchaseType } from 'ukbc/enums';
import { IOfferProduct, IPrice, IProduct, IRemoveProductDialogFields, IVehicleState } from 'ukbc/models';

import { getProductNumberFromProductCode, GetProductsThatApplyToVehicles, replaceProductPricePlaceholder } from 'ukbc/helpers';
import { ProductRemovedComponent } from 'ukbc/components/product-modals/product-removed.component';
import { ProductPreReqRequiredComponent } from 'ukbc/components/product-modals/product-pre-req-required.component';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { PurchaseTypeChangeRequiredComponent } from 'ukbc/components/product/disallowed-purchase-type/purchase-type-change-required.component';
import { arrayContainsArray, arraysShareItem, punctuateList } from 'scripts/utils';
import { VehicleRulesDialogComponent } from 'ukbc/components/product-modals/vehicle-rules-dialog.component';

@Injectable()
export class ProductEffects {
	constructor(private actions$: Actions, private store$: Store<fromRoot.State>, private analyticsService: CheckoutAnalyticsService) {}

	@Effect()
	beginSelectProduct$ = this.actions$
		.ofType<productActions.BeginSelectProductAction>(productActions.BEGIN_SELECT_PRODUCT)
		.withLatestFrom(this.store$, (action, state) => ({ action, state }))
		.switchMap(({ action, state }: { action: productActions.BeginSelectProductAction; state: fromRoot.State }) => {
			const productsBeingSelected = state.products.allProducts.filter(product => action.payload.productCodes.includes(product.ProductCode));
			const nextSelectedProducts = [...state.products.selectedProducts, ...productsBeingSelected];
			const questionId = action.payload.questionId;
			const actions: Action[] = [];

			// Prompt the user that adding products which are not allowed for the selected purchase type will change the selected purchase type
			const purchaseType: EPurchaseType = state.payment.payment.model.purchaseType;
			const productsBeingSelectedForWhichCurrentPurchaseTypeIsDisallowed = productsBeingSelected.filter(
				p => p.DisallowedPurchaseType === purchaseType
			);
			for (const product of productsBeingSelectedForWhichCurrentPurchaseTypeIsDisallowed) {
				actions.push(
					new dialogActions.CreateDialogAction({
						id: 'purchase-type-change-required',
						component: PurchaseTypeChangeRequiredComponent,
						componentInputs: { product, questionId },
						open: true,
						hideCloseButton: true,
					})
				);
			}

			// Prompt the user that adding products without prereqs selected will add the prereqs
			const productsWithoutPreReqSelected = productsBeingSelected
				.filter(product => product.PreReqProduct)
				.filter(product => !nextSelectedProducts.find(p => p.ProductCode === product.PreReqProduct));
			for (const product of productsWithoutPreReqSelected) {
				actions.push(
					new dialogActions.CreateDialogAction({
						id: 'confirm-prereq-required',
						component: ProductPreReqRequiredComponent,
						componentInputs: { productBeingAdded: product, questionId },
						open: true,
						hideCloseButton: true,
					})
				);
			}

			// Check if product being added have any vehicle rules
			const productsBeingAddedWithVehicleRules = productsBeingSelected.filter(
				product => product.VehicleRules && (product.VehicleRules.MaxAge || product.VehicleRules.MaxMileage)
			);

			if (productsBeingAddedWithVehicleRules.length) {
				actions.push(
					...this.getUpdateVehicleActions(
						[...state.products.selectedProducts, ...productsBeingAddedWithVehicleRules],
						state.vehicles.vehicles
					)
				);

				actions.push(
					new dialogActions.CreateDialogAction({
						id: 'vehicle-rules-dialog',
						open: true,
						component: VehicleRulesDialogComponent,
						componentInputs: {
							selectedProducts: state.products.selectedProducts,
							vehicleRulesProducts: productsBeingAddedWithVehicleRules,
							questionId,
						},
					})
				);
			}

			// Automatically confirm selecting all products where user confirmation is not required.
			const productsNotRequiringConfirmation = productsBeingSelected
				.filter(product => !productsWithoutPreReqSelected.includes(product))
				.filter(product => !productsBeingSelectedForWhichCurrentPurchaseTypeIsDisallowed.includes(product))
				.filter(product => !productsBeingAddedWithVehicleRules.includes(product));

			if (productsNotRequiringConfirmation.length > 0) {
				actions.push(
					new productActions.ConfirmSelectProductAction({
						productCodes: productsNotRequiringConfirmation.map(p => p.ProductCode),
						source: action.payload.source,
					})
				);

				if (questionId) {
					actions.push(new questionActions.AnswerQuestion(questionId));
				}
			}

			return actions; // Returned actions will be dispatched
		});

	@Effect()
	beginDeselectProduct$ = this.actions$
		.ofType<productActions.BeginDeselectProductAction>(productActions.BEGIN_DESELECT_PRODUCT)
		.withLatestFrom(this.store$, (action, state) => ({ action, state }))
		.switchMap(({ action, state }: { action: productActions.BeginDeselectProductAction; state: fromRoot.State }) => {
			const actions: Action[] = [];
			const questionId = action.payload.questionId;
			const selectedProducts = state.products.selectedProducts;
			const selectedProductCodes = selectedProducts.map(p => p.ProductCode);
			const productCodesBeingRemoved = action.payload.productCodes.filter(code => selectedProductCodes.includes(code));

			const allProducts = state.products.allProducts;
			const offer = state.content.ContentInformation.Offer;
			const offerProducts = offer && offer.OfferProducts ? offer.OfferProducts : [];
			const productsRequiringRemovedProducts = selectedProducts.filter(p => productCodesBeingRemoved.includes(p.PreReqProduct));
			const productsNotRequiringConfirmation = productCodesBeingRemoved.filter(
				productCode => !productsRequiringRemovedProducts.map(p => p.PreReqProduct).includes(productCode)
			);
			const productsBeingRemoved = allProducts.filter(product => productCodesBeingRemoved.includes(product.ProductCode));

			let pricing: IPrice;

			this.store$
				.select(fromRoot.getPricing)
				.pipe(take(1))
				.subscribe(p => (pricing = p));

			const dialogContent: IRemoveProductDialogFields = {
				messages: [],
				confirmButtonText: '',
				cancelButtonText: '',
				moreInfoButtonText: '',
				moreInfoText: '',
			};

			this.handleRemovalOfProduct(productsBeingRemoved, dialogContent);
			this.handleRemovalOfPrerequisite(productsRequiringRemovedProducts, pricing, dialogContent);
			this.handleRemovalOfOfferProducts(offerProducts, productCodesBeingRemoved, dialogContent, selectedProductCodes);
			this.handleRemovalOfOfferPrerequisiteProducts(
				offerProducts,
				productCodesBeingRemoved,
				selectedProductCodes,
				dialogContent,
				allProducts
			);

			if (dialogContent.messages.length) {
				actions.push(
					new dialogActions.CreateDialogAction({
						id: 'product-removed',
						component: ProductRemovedComponent,
						componentInputs: {
							content: dialogContent.messages.join(state.content.ContentInformation.GeneralInfo.ProductRemoveDialogJoin),
							confirmButtonText: dialogContent.confirmButtonText,
							cancelButtonText: dialogContent.cancelButtonText,
							moreInfoButtonText: dialogContent.moreInfoButtonText,
							moreInfoText: dialogContent.moreInfoText,
							productCodesBeingRemoved,
							productCodesRequiringProducts: productsRequiringRemovedProducts.map(p => p.ProductCode),
						},
						open: true,
						hideCloseButton: true,
					})
				);
			} else {
				actions.push(
					new productActions.ConfirmDeselectProductAction({ productCodes: productsNotRequiringConfirmation, source: action.payload.source })
				);

				if (questionId) {
					actions.push(new questionActions.AnswerQuestion(questionId));
				}
			}

			return actions;
		});
	@Effect()
	confirmProduct$: Observable<Action> = this.actions$
		.ofType(productActions.CONFIRM_SELECT_PRODUCT, productActions.CONFIRM_DESELECT_PRODUCT)
		.withLatestFrom(this.store$, (action, state) => ({ action, state }))
		// switchMap will only run map for the last service invocation and cancel previous requests
		.switchMap(
			({
				action,
				state,
			}: {
				action: productActions.ConfirmSelectProductAction | productActions.ConfirmDeselectProductAction;
				state: fromRoot.State;
			}) => {
				const actions: Action[] = [];

				actions.push(...this.getUpdateVehicleActions(state.products.selectedProducts, state.vehicles.vehicles, state.vehicles.completedVehicles, state.card.completedCardTypes));
				actions.push(...this.getUpdateContactsActions(state));

				const selectedProducts = state.products.allProducts.filter(p => action.payload.productCodes.includes(p.ProductCode));
				const basisProducts = selectedProducts.filter(p => p.ParentProduct);

				actions.push(new pricingActions.GetPricesAction());

				if (basisProducts.length) {
					if (action.type === productActions.CONFIRM_SELECT_PRODUCT) {
						basisProducts.forEach(p => actions.push(new questionActions.ShowQuestionByParentProduct(p.ParentProduct)));
					} else {
						basisProducts.forEach(p => actions.push(new questionActions.HideQuestionByParentProduct(p.ParentProduct)));
					}
				}
				// If the action contains a card to complete AND it's the vehicle card then make sure all vehicles are completed.
				if (action.type === productActions.CONFIRM_SELECT_PRODUCT
					&& action.payload.cardToComplete
					&& (action.payload.cardToComplete !== EDetailsCardType.Vehicles 
					|| (action.payload.cardToComplete === EDetailsCardType.Vehicles && state.vehicles.vehicles.length === state.vehicles.completedVehicles.length))) {
					actions.push(new cardActions.CompleteCard(action.payload.cardToComplete));
				}

				if (selectedProducts.length) {
					if (action.type === productActions.CONFIRM_SELECT_PRODUCT) {
						this.analyticsService.TrackProductsAdded(selectedProducts, action.payload.source);
					} else { 
						this.analyticsService.TrackProductsRemoved(selectedProducts, action.payload.source);
					}
				}

				if (state.payment.options !== null) {
					actions.push(new paymentActions.ResetPaymentOptionsAction());
					actions.push(new cardActions.InvalidateCardsInCategory(ECardCategory.Payment));
				} else {
					actions.push(new paymentActions.SetPaymentMethodAction());
				}

				return actions;
			}
		);

	private getUpdateVehicleActions(selectedProducts: IProduct[], vehicles: IVehicleState[], completedVehicles?: any[], completedCards?: string[]): (vehicleActions.Actions | cardActions.Actions)[]  {
		const actions: (vehicleActions.Actions | cardActions.Actions)[] = [];
		const productsThatApplyToVehicles = GetProductsThatApplyToVehicles(selectedProducts);
		const currentNumberOfVehicles = vehicles.length;

		if (productsThatApplyToVehicles.length) {
			let highestVehicleIndex = 0;

			productsThatApplyToVehicles.forEach(p => {
				// Array of indexes that this product and it's rules should apply to.
				const vehicleIndexes = p.AppliesToVehicles.map((value, index) => (value ? index : null)).filter(item => item !== null);
				highestVehicleIndex = Math.max(highestVehicleIndex, ...vehicleIndexes);
			});

			for (let i = 0; i <= Math.max(highestVehicleIndex, currentNumberOfVehicles - 1); i++) {
				if (i > highestVehicleIndex) {
					actions.push(new vehicleActions.AutomaticallyRemoveVehicle());
				} else if (i >= currentNumberOfVehicles) {
					actions.push(new vehicleActions.AutomaticallyAddVehicle({ index: i, selectedProducts }));
						// If the completed vehicles and number of vehicles are the same then we want to un-complete the vehicles card. This is
						// because if we're hitting here then we are adding another vehicle which would mean we have un-completed vehicles.
						if ((completedVehicles && currentNumberOfVehicles === completedVehicles.length) && (completedCards && completedCards.includes(EDetailsCardType.Vehicles))) {
							actions.push(new cardActions.UncompleteCard(EDetailsCardType.Vehicles));
						}
				} else {
					actions.push(new vehicleActions.SetProductRulesForVehicle({ index: i, selectedProducts }));
				}
			}
		} else {
			// Remove all vehicles if no products apply to vehicles
			for (let i = 0; i < currentNumberOfVehicles; i++) {
				actions.push(new vehicleActions.AutomaticallyRemoveVehicle());
			}
		}
		return actions;
	}

	private getUpdateContactsActions(state: fromRoot.State): contactActions.Actions[] {
		const numberExistingContacts = state.contacts.contacts.length;
		const selectedPbmProduct = state.products.selectedProducts.find(product => product.ParentProduct === EBaseProductPrefix.PBM);

		if (numberExistingContacts > 1 && selectedPbmProduct == null) {
			return [new contactActions.SetContacts(1)];
		} else if (selectedPbmProduct != null && numberExistingContacts !== getProductNumberFromProductCode(selectedPbmProduct.ProductCode)) {
			return [new contactActions.SetContacts(getProductNumberFromProductCode(selectedPbmProduct.ProductCode))];
		}
	}

	private handleRemovalOfProduct(productsBeingRemoved: IProduct[], dialogContent: IRemoveProductDialogFields): void {
		productsBeingRemoved.filter(product => product.RemovalWarning && product.RemovalConfirm && product.RemovalCancel).forEach(product => {
			dialogContent.messages.push(product.RemovalWarning);

			if (!dialogContent.confirmButtonText) {
				dialogContent.confirmButtonText = product.RemovalConfirm;
			}

			if (!dialogContent.cancelButtonText) {
				dialogContent.cancelButtonText = product.RemovalCancel;
			}
		});
	}

	private handleRemovalOfPrerequisite(
		productsRequiringRemovedProducts: IProduct[],
		pricing: IPrice,
		dialogContent: IRemoveProductDialogFields
	): void {
		productsRequiringRemovedProducts.forEach(product => {
			dialogContent.messages.push(replaceProductPricePlaceholder(product.PreReqRemovedModalDescription, product, pricing));

			dialogContent.moreInfoButtonText = replaceProductPricePlaceholder(product.PreReqRemovedModalMoreInfoLink, product, pricing);
			dialogContent.moreInfoText = replaceProductPricePlaceholder(product.PreReqRemovedModalMoreInfoText, product, pricing);

			if (!dialogContent.confirmButtonText) {
				dialogContent.confirmButtonText = replaceProductPricePlaceholder(
					product.PreReqRemovedModalConfirmationButtonText,
					product,
					pricing
				);
			}

			if (!dialogContent.cancelButtonText) {
				dialogContent.cancelButtonText = replaceProductPricePlaceholder(product.PreReqRemovedModalCancelButtonText, product, pricing);
			}
		});
	}

	private handleRemovalOfOfferProducts(
		offerProducts: IOfferProduct[],
		productCodesBeingRemoved: string[],
		dialogContent: IRemoveProductDialogFields,
		selectedProductCodes: string[]
	): void {
		// Find if any products that are free are being removed
		const offerProductsBeingRemoved = offerProducts.filter(
			product =>
				product.RemovalModalContent &&
				arraysShareItem(product.Products, productCodesBeingRemoved) &&
				arrayContainsArray(selectedProductCodes, product.PrerequisiteProductCodeSelection)
		);

		// Map content
		offerProductsBeingRemoved.forEach(product => {
			dialogContent.messages.push(product.RemovalModalContent);

			if (!dialogContent.confirmButtonText) {
				dialogContent.confirmButtonText = product.RemovalModalConfirmText;
			}

			if (!dialogContent.cancelButtonText) {
				dialogContent.cancelButtonText = product.RemovalModalCancelText;
			}
		});
	}

	private handleRemovalOfOfferPrerequisiteProducts(
		offerProducts: IOfferProduct[],
		productCodesBeingRemoved: string[],
		selectedProductCodes: string[],
		dialogContent: IRemoveProductDialogFields,
		allProducts: IProduct[]
	): void {
		// Find if any products that are prerequisites to another product being free are being removed
		const offerPrerequisitesBeingRemoved = offerProducts.filter(
			product =>
				product.PrerequisiteRemovalModalContent &&
				arraysShareItem(product.Products, selectedProductCodes) &&
				arraysShareItem(product.PrerequisiteProductCodeSelection, productCodesBeingRemoved) &&
				arrayContainsArray(selectedProductCodes, product.PrerequisiteProductCodeSelection)
		);

		// Map content
		offerPrerequisitesBeingRemoved.forEach(product => {
			const productNamesBeingRemoved = productCodesBeingRemoved.map(code => allProducts.find(p => p.ProductCode === code).Title);

			const punctuatedProductsBeingRemoved = punctuateList(productNamesBeingRemoved);

			dialogContent.messages.push(
				product.PrerequisiteRemovalModalContent.replace('{product}', `<strong>${punctuatedProductsBeingRemoved}</strong>`)
			);

			if (!dialogContent.confirmButtonText) {
				dialogContent.confirmButtonText = product.PrerequisiteRemovalModalConfirm.replace('{product}', punctuatedProductsBeingRemoved);
			}

			if (!dialogContent.cancelButtonText) {
				dialogContent.cancelButtonText = product.PrerequisiteRemovalModalCancel.replace('{product}', punctuatedProductsBeingRemoved);
			}
		});
	}
}
