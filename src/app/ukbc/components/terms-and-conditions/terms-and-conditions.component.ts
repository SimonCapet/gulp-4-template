import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import * as fromRoot from 'ukbc/reducers';
import { EYesNoType } from 'ukbc/enums';
import { Store } from '@ngrx/store';
import { CheckoutAnalyticsService, CoverService } from 'ukbc/services';
import * as consentActions from 'ukbc/actions/consent.actions';

const MARKETING_OPTION_ID = 'marketing-consent';
const PAPERLESS_OPTION_ID = 'paperless-consent';

@Component({
	selector: 'ukbc-terms-and-conditions',
	styleUrls: ['./terms-and-conditions.component.scss'],
	templateUrl: './terms-and-conditions.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsAndConditionsComponent
	implements OnInit, OnDestroy, OnChanges {
	@Input() termsAndConditions: string;

	private marketingConsentSubscription: Subscription;
	private paperlessConsentSubscription: Subscription;
	private marketingConsent: boolean;
	private paperlessConsent: boolean;
	private marketingConsentCheckbox: HTMLInputElement;
	private paperlessConsentCheckbox: HTMLInputElement;

	constructor(
		private store: Store<fromRoot.State>,
		private checkoutAnalyticsService: CheckoutAnalyticsService,
		private cover: CoverService,
	) {}

	public ngOnInit() {
		this.marketingConsentSubscription = this.store
			.select(fromRoot.getMarketingConsent)
			.subscribe(consent => {
				this.marketingConsent = consent === EYesNoType.Yes;
			});
		this.paperlessConsentSubscription = this.store
			.select(fromRoot.getPaperlessConsent)
			.subscribe(consent => {
				this.paperlessConsent = consent === EYesNoType.Yes;
			});
	}

	ngOnChanges() {
		// Timeout to allow Angular to render the innerHTML before interacting with it.
		setTimeout(() => {
			this.getConsentOptionsFromHTML().then(() => {
				this.setConsentOptionsClickHandlers();
				this.setConsentsInHTML();
			});
		});
	}

	public ngOnDestroy() {
		this.marketingConsentSubscription.unsubscribe();
		this.paperlessConsentSubscription.unsubscribe();
	}

	private async getConsentOptionsFromHTML() {
		this.marketingConsentCheckbox = <HTMLInputElement>document.getElementById(
			MARKETING_OPTION_ID,
		);
		this.paperlessConsentCheckbox = <HTMLInputElement>document.getElementById(
			PAPERLESS_OPTION_ID,
		);
	}

	// Updates the marketing/paperless checkboxes in the communication FAQ based on the value in the state
	private setConsentsInHTML() {
		this.marketingConsentCheckbox.checked = this.marketingConsent;
		this.paperlessConsentCheckbox.checked = this.paperlessConsent;
	}

	private setConsentOptionsClickHandlers() {
		if (this.marketingConsentCheckbox) {
			this.marketingConsentCheckbox.addEventListener(
				'click',
				this.toggleMarketingPreference.bind(this),
			);
		}

		if (this.paperlessConsentCheckbox) {
			this.paperlessConsentCheckbox.addEventListener(
				'click',
				this.togglePaperlessPreference.bind(this),
			);
		}
	}

	private get marketingPreference(): EYesNoType {
		return !this.marketingConsent ? EYesNoType.Yes : EYesNoType.No;
	}

	private get paperlessPreference(): EYesNoType {
		return !this.paperlessConsent ? EYesNoType.Yes : EYesNoType.No;
	}

	private toggleMarketingPreference() {
		this.checkoutAnalyticsService.TrackingTermsAndConditionsConsentClick(
			'EmailMarketing',
			this.marketingPreference,
		);
		this.store.dispatch(
			new consentActions.SetEmailConsent(this.marketingPreference),
		);
		this.cover.SaveCover();
	}

	private togglePaperlessPreference() {
		this.checkoutAnalyticsService.TrackingTermsAndConditionsConsentClick(
			'Paperless',
			this.paperlessPreference,
		);
		this.store.dispatch(
			new consentActions.SetDocumentsConsent(this.paperlessPreference),
		);
		this.cover.SaveCover();
	}
}
