import { Component, Input, ViewEncapsulation, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import * as fromRoot from 'ukbc/reducers';
import * as consentActions from 'ukbc/actions/consent.actions';
import { IProduct, IFaq } from 'ukbc/models';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { EYesNoType } from 'ukbc/enums';

const MARKETING_OPTION_ID = 'marketing-consent';
const PAPERLESS_RADIO_NAME = 'paperless-consent';
const PAPERLESS_OPTION_ID = 'paperless-consent-online';

interface CalloutsJSON {
	unlimitedCalloutsProducts: string[];
	unlimitedCalloutsText: string;
	limitedCalloutsText: string;
}
@Component({
	selector: 'ukbc-faqs',
	templateUrl: 'faqs.component.html',
	styleUrls: ['faqs.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class FaqsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() title: string;
	@Input() faqs: IFaq[];
	@Input() selectedProducts: IProduct[];

	private selectedProductCodes: String[];
	private marketingConsentSubscription: Subscription;
	private paperlessConsentSubscription: Subscription;
	private marketingConsent: boolean;
	private paperlessConsent: boolean;
	private marketingConsentCheckbox: HTMLInputElement;
	private paperlessConsentRadios: HTMLInputElement[];

	public AllOpen = false;
	public OpenState: boolean[] = [];

	constructor(private store: Store<fromRoot.State>, private checkoutAnalyticsService: CheckoutAnalyticsService) {}

	ngOnInit() {
		this.marketingConsentSubscription = this.store.select(fromRoot.getMarketingConsent).subscribe(consent => {
			this.marketingConsent = consent === EYesNoType.Yes;
		});
		this.paperlessConsentSubscription = this.store.select(fromRoot.getPaperlessConsent).subscribe(consent => {
			this.paperlessConsent = consent === EYesNoType.Yes;
		});
	}

	ngOnChanges() {
		this.selectedProductCodes = this.selectedProducts.map(p => p.ProductCode);
		// Timeout to allow Angular to render the innerHTML before interacting with it.
		setTimeout(() => {
			this.getConsentOptionsFromHTML().then(() => {
				this.setConsentOptionsClickHandlers();
				this.setConsentsInHTML();
			});
			this.replaceCalloutNumberInHTML();
		});
		if (this.OpenState.length === 0) {
			this.OpenState = this.faqs.map(faq => faq.Expanded);
		}
	}

	ngOnDestroy() {
		this.marketingConsentSubscription.unsubscribe();
		this.paperlessConsentSubscription.unsubscribe();
	}

	private replaceCalloutNumberInHTML() {
		const noOfCalloutsHTML = <HTMLElement>document.querySelector('[data-callouts]');

		if (noOfCalloutsHTML) {
			const noOfCalloutsObj = <CalloutsJSON>JSON.parse(noOfCalloutsHTML.getAttribute('data-callouts'));
			// the product offers unlimited callouts only if every product provided
			// in [data-callouts] via the CMS is included in this.selectedProductCodes
			const unlimitedCalloutsProduct: boolean = noOfCalloutsObj.unlimitedCalloutsProducts
				? noOfCalloutsObj.unlimitedCalloutsProducts.every(code => this.selectedProductCodes.includes(code))
				: false;
			const unlimitedCalloutsText = noOfCalloutsObj.unlimitedCalloutsText;
			const limitedCalloutsText = noOfCalloutsObj.limitedCalloutsText;

			noOfCalloutsHTML.innerHTML = unlimitedCalloutsProduct ? unlimitedCalloutsText : limitedCalloutsText;
		}
	}

	private async getConsentOptionsFromHTML() {
		this.marketingConsentCheckbox = <HTMLInputElement>document.getElementById(MARKETING_OPTION_ID);
		this.paperlessConsentRadios = <HTMLInputElement[]>(<any>document.getElementsByName(PAPERLESS_RADIO_NAME));
	}

	// Updates the marketing/paperless checkboxes in the communication FAQ based on the value in the state
	private setConsentsInHTML() {
		this.marketingConsentCheckbox.checked = this.marketingConsent;

		// Set the online radio to checked if the paperlessConsent is true,
		// otherwise set the paper radio to checked.
		for (let i = 0; i < this.paperlessConsentRadios.length; i++) {
			switch (this.paperlessConsentRadios[i].id) {
				case PAPERLESS_OPTION_ID:
					this.paperlessConsentRadios[i].checked = this.paperlessConsent;
					break;
				default:
					this.paperlessConsentRadios[i].checked = !this.paperlessConsent;
					break;
			}
		}
	}

	private setConsentOptionsClickHandlers() {
		if (this.marketingConsentCheckbox) {
			this.marketingConsentCheckbox.addEventListener('click', this.toggleMarketingPreference.bind(this));
		}
		if (this.paperlessConsentRadios) {
			for (let i = 0; i < this.paperlessConsentRadios.length; i++) {
				this.paperlessConsentRadios[i].addEventListener('change', this.togglePaperlessPreference.bind(this));
			}
		}
	}

	private get marketingPreference(): EYesNoType {
		return !this.marketingConsent ? EYesNoType.Yes : EYesNoType.No;
	}

	private get paperlessPreference(): EYesNoType {
		return !this.paperlessConsent ? EYesNoType.Yes : EYesNoType.No;
	}

	private toggleMarketingPreference() {
		this.checkoutAnalyticsService.TrackingTermsAndConditionsConsentClick('EmailMarketing', this.marketingPreference);
		this.store.dispatch(new consentActions.SetEmailConsent(this.marketingPreference));
	}

	private togglePaperlessPreference() {
		this.checkoutAnalyticsService.TrackingTermsAndConditionsConsentClick('Paperless', this.paperlessPreference);
		this.store.dispatch(new consentActions.SetDocumentsConsent(this.paperlessPreference));
	}

	public ToggleAll(): void {
		this.AllOpen = !this.AllOpen;
		this.OpenState = this.OpenState.map(() => this.AllOpen);

		if (this.AllOpen) {
			this.checkoutAnalyticsService.TrackEvent('FAQOpenAll');
		}
	}

	public ToggleFAQ(index: number, analyticsId: string, $event: Event): void {
		$event.preventDefault();

		this.OpenState[index] = !this.OpenState[index];

		if (this.OpenState[index]) {
			this.checkoutAnalyticsService.TrackEvent(`FAQOpen`, { type: analyticsId });
		}

		this.AllOpen = !this.OpenState.includes(false);
	}
}
