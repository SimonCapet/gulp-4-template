import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

import * as fromRoot from 'ukbc/reducers';

import { EOfferType, EPurchaseType } from 'ukbc/enums';
import { IProduct, IPrice, IInitialState, IOfferThreshold } from 'ukbc/models';
import { arraysShareItem, punctuateList } from 'scripts/utils';

@Injectable()
export class OfferService {
	private content: IInitialState;
	private pricing: IPrice;
	private selectedProducts: IProduct[];
	private allProducts: IProduct[];

	constructor(private store: Store<fromRoot.State>) {
		this.store.select(fromRoot.getSelectedProducts).subscribe(selectedProducts => (this.selectedProducts = selectedProducts));
		this.store
			.select(fromRoot.getAllProducts)
			.pipe(take(1))
			.subscribe(allProducts => (this.allProducts = allProducts));
		this.store.select(fromRoot.getContent).subscribe(content => (this.content = content));
		this.store.select(fromRoot.getPricing).subscribe(pricing => (this.pricing = pricing));
	}

	public GetProductOffer(productCode: string, selected: boolean): { offerMessage: string; backgroundColour: string | null } {
		const offer = this.content.ContentInformation.Offer;
		let offerMessage: string;
		let backgroundColour: string | null;

		if (!!offer && offer.Type === EOfferType.ProductOffer) {
			offer.OfferProducts
				.filter(offerProduct => {
					let showOffer = true;
					// If the offer product isn't available or the product code is not included in the offer product codes, hide the offer
					if (!offerProduct.Available || !offerProduct.Products.includes(productCode)) {
						showOffer = false;
					}
					// If the selected product codes are incompatible with the offer, hide the messsage
					if (
						offerProduct.IncompatibleProductCodeSelection.length &&
						arraysShareItem(this.selectedProducts, offerProduct.IncompatibleProductCodeSelection)
					) {
						showOffer = false;
					}
					// If the product is selected and the offer doesn't display when the product is selected, hide the offer
					if (selected && !offerProduct.DisplayTextIfSelected) {
						showOffer = false;
					}
					// If the offer is set to display for a specific frequency and that frequency isn't the selected one, hide the offer
					if (
						offerProduct.AvailableFor &&
						offerProduct.AvailableFor.length &&
						!offerProduct.AvailableFor.includes(this.pricing.frequency)
					) {
						showOffer = false;
					}
					return showOffer;
				})
				.forEach(offerProduct => {
					const missingPrerequisiteProductCodes = offerProduct.PrerequisiteProductCodeSelection.filter(
						prerequisite => !this.selectedProducts.find(product => product.ProductCode === prerequisite)
					);

					if (missingPrerequisiteProductCodes.length && offerProduct.TextToDisplayIfPrerequisiteRequired) {
						const missingProductNames = missingPrerequisiteProductCodes.map(
							code => this.allProducts.find(p => p.ProductCode === code).Title
						);

						offerMessage = offerProduct.TextToDisplayIfPrerequisiteRequired.replace('{products}', punctuateList(missingProductNames, true));
					} else if (!missingPrerequisiteProductCodes.length && offerProduct.TextToDisplay) {
						offerMessage = offerProduct.TextToDisplay;
					}

					backgroundColour = offerProduct.BackgroundColour;
				});
		}

		if (!!offer && offer.Type === EOfferType.ThresholdOffer) {
			const totalAmount = this.pricing.total;
			offer.OfferThresholds.forEach(threshold => {
				if (threshold.Amount > totalAmount && !!offerMessage) {
					offerMessage = this.getUpsellMessage(totalAmount, threshold, this.pricing.frequency === EPurchaseType.Annual);
				}
			});
		}

		return { offerMessage, backgroundColour };
	}

	private getUpsellMessage(total: number, threshold: IOfferThreshold, annualPayment: boolean): string {
		const message = annualPayment ? threshold.UpsellMessageAnnual : threshold.UpsellMessageMonthly;
		let spend = threshold.Amount - total;
		if (!annualPayment && spend > 0) {
			spend = spend / 12;
		}

		return message.replace('{amount}', spend.toFixed(2));
	}
}
