import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { skipWhile, take } from 'rxjs/operators';
import { sortBy } from 'sort-by-typescript';

import * as fromRoot from 'ukbc/reducers';
import { AnalyticsService } from 'shared/services/analytics.service';
import { isMobile } from 'scripts/helpers/is-mobile';
import { IProduct, IStep, IInitialState, IJourneyContent, IQuestionState } from 'ukbc/models';
import {
	EPaymentType,
	EPurchaseType,
	ECoverOptionsGroup,
	EYesNoType,
	EDetailsCardType,
	EPaymentCardType,
	EProductSelectionSource,
	EStepType,
	EPolicyDuration,
} from 'ukbc/enums';
import { validate } from 'shared/services/validator';
import { coverRules } from 'ukbc/validation-rules';

const sectionNameMap = {
	[EDetailsCardType.Members]: 'MembersDetails',
	[EDetailsCardType.Address]: 'Address',
	[EDetailsCardType.Vehicles]: 'Vehicles',
	[EPaymentCardType.CoverStartDate]: 'CoverStartDate',
	[EPaymentCardType.PaymentDetails]: 'PaymentMethod',
	[EPaymentCardType.CardPayment]: 'FirstInstallment',
};

@Injectable()
export class CheckoutAnalyticsService {
	private currentRouteUrl: String;
	private content$: Observable<IInitialState>;
	private journeyContent: IJourneyContent;
	private coreProduct: string;
	private coreProductPrefix: string;
	private coreProductNumber: number;
	private appLoaded = false;
	private analyticsPrefix: string;
	private journeyType: string;
	private journeySiteName: string;

	private currentStep: IStep;
	private previousSelectedProducts: IProduct[];
	private selectedProducts: IProduct[];

	constructor(
		private store: Store<fromRoot.State>,
		private analyticsService: AnalyticsService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private datePipe: DatePipe,
		private decimalPipe: DecimalPipe
	) {
		this.content$ = store.select(fromRoot.getContent);
		this.initPageChangeListener();

		this.content$.subscribe(content => {
			this.journeyContent = content.ContentInformation.Journey;
			this.coreProduct = this.journeyContent.CoreProductCode;
			this.analyticsPrefix = this.journeyContent.AnalyticsPrefix;
			this.journeyType = this.journeyContent.JourneyType;
			this.journeySiteName = this.journeyContent.JourneySiteName;
			({ productPrefix: this.coreProductPrefix, productNumber: this.coreProductNumber } = this.getProductPrefixAndNumber(this.coreProduct));
		});

		this.store.select(fromRoot.getCurrentStep).subscribe(step => (this.currentStep = step));
		this.store.select(fromRoot.getSelectedProducts).subscribe(codes => {
			this.previousSelectedProducts = this.selectedProducts || codes;
			this.selectedProducts = codes;
		});
	}

	public TrackEvent(eventName: string, eventPayload?: {}): void {
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_${eventName}`, eventPayload);
	}

	public UpdateInitialPrices(initialPrice): void {
		this.analyticsService.updateDataLayer({
			initialPrice: {
				monthly: this.decimalPipe.transform(initialPrice.monthly, '1.2-2'),
				annual: this.decimalPipe.transform(initialPrice.annual, '1.2-2'),
			},
		});
	}

	public UpdateCoverStartDate(date: Date): void {
		if (validate(coverRules.StartDate, date).isValid) {
			this.analyticsService.updateDataLayer({
				paymentDetails: {
					coverStartDate: this.datePipe.transform(date, 'dd/MM/y'),
				},
			});
		}
	}

	public UpdatePaymentFrequency(frequency): void {
		const paymentFrequency = frequency === EPurchaseType.Monthly ? 'monthly' : (<string>EPurchaseType.Annual).toLowerCase();
		this.analyticsService.updateDataLayer({ paymentFrequency });
	}

	public UpdatePolicyDuration(duration): void {
		const policyDuration = (<string>duration).toLowerCase();
		this.analyticsService.updateDataLayer({ policyDuration });
	}

	public TrackServerError(serverError: String): void {
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_ServerError`, {
			serverError,
		});
	}

	public TrackBasketFrequencyToggleClicked(frequency: EPurchaseType): void {
		this.analyticsService.trackEvent(
			`${this.analyticsPrefix}_BasketPricingFrequencyToggleClicked${<string>frequency === 'Single' ? 'Monthly' : frequency}`
		);
	}

	public TrackBasketDurationToggleClicked(duration: EPolicyDuration): void {
		this.analyticsService.trackEvent(
			`${this.analyticsPrefix}_BasketPricingDurationToggleClicked${duration === EPolicyDuration.TwoYears ? '2Year' : '1Year'}`
		);
	}

	public TrackPaymentMethodButtonClicked(type: EPaymentType): void {
		this.analyticsService.updateDataLayer({
			paymentDetails: { paymentMethod: type.toLowerCase() },
		});
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_PaymentMethod${type}ButtonClicked`);
	}

	public TrackProductsAdded(products: IProduct[], source: EProductSelectionSource): void {
		this.TrackEvent(`AddProducts${source}`, { addedProducts: this.getProductsString(products) });
		this.analyticsService.updateDataLayer({ selectedCover: this.getSelectedProductCodes(this.selectedProducts) });
	}

	public TrackProductsRemoved(products: IProduct[], source: EProductSelectionSource): void {
		this.TrackEvent(`RemoveProducts${source}`, { removedProducts: this.getProductsString(products) });
		this.analyticsService.updateDataLayer({ selectedCover: this.getSelectedProductCodes(this.selectedProducts) });
	}

	private getProductsString(products: IProduct[]): string {
		const previousProductCodes = this.getSelectedProductCodes(this.previousSelectedProducts).join(' ');
		const selectedProductCodes = this.getSelectedProductCodes(products).join(' ');

		return `${this.analyticsPrefix} ${this.currentStep.type} | ${previousProductCodes} | ${selectedProductCodes}`;
	}

	private getSelectedProductCodes(products: IProduct[]): string[] {
		return products.sort(sortBy('sort')).map(p => p.ProductCode);
	}

	public TrackAgreeToDirectDebitTerms(preference: boolean): void {
		const eventName = preference ? `${this.analyticsPrefix}_FormFieldTickedAgree` : `${this.analyticsPrefix}_FormFieldUntickedAgree`;
		this.analyticsService.trackEvent(eventName);
	}

	public TrackingTermsAndConditionsConsentClick(consentType: string, preference?: EYesNoType | boolean) {
		if (consentType === 'Terms') {
			this.analyticsService.trackEvent(preference ? 'TandCsAgree' : 'TandCsDisagree');
		} else {
			this.analyticsService.trackEvent(`TandCs${consentType}${preference === EYesNoType.Yes ? 'Yes' : 'No'}`);
		}
	}

	public TrackSectionEditClicked(sectionName: string): void {
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_SectionEdit`, {
			sectionName: sectionNameMap[sectionName] || sectionName,
		});
	}

	public TrackSectionContinueClicked(sectionName: string): void {
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_SectionContinueClicked`, {
			sectionName: sectionNameMap[sectionName],
		});
	}

	public TrackSectionSaveDetails(sectionName: string): void {
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_SectionSaveDetails`, {
			sectionName,
		});
	}

	public TrackSectionRemove(sectionName: string): void {
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_SectionRemove`, { sectionName });
	}

	public TrackTermsAndConditionsLinkClicked(): void {
		this.analyticsService.trackEvent(`${this.analyticsPrefix}_TermsAndConditionsLinkClicked`);
	}

	private getPageLoadData(initialLoad, pageType: string): Promise<Object> {
		return new Promise(resolve => {
			this.store
				.select(state => state)
				.pipe(skipWhile(state => !state.pricing.received), take(1))
				.subscribe(state => {
					const selectedCoreCoverType = this.coreProductPrefix;
					const selectedCoreCoverLevel = this.coreProductNumber;
					const selectedCover = this.getCover(state.products.selectedProducts);
					const selectedCoverExtras = this.getCoverExtras(state.products.selectedProducts);
					const prices = {
						monthly: this.decimalPipe.transform(state.pricing.total.monthly, '1.2-2'),
						annual: this.decimalPipe.transform(state.pricing.total.annual, '1.2-2'),
					};
					const paymentFrequency =
						state.pricing.frequency === EPurchaseType.Monthly ? 'monthly' : (<string>EPurchaseType.Annual).toLowerCase();
					const paymentDetails = {
						paymentMethod: state.payment.payment.model.paymentType ? state.payment.payment.model.paymentType.toLowerCase() : '',
					};
					if (pageType === 'payment') {
						paymentDetails['coverStartDate'] = this.datePipe.transform(state.cover.model.StartDate, 'dd/MM/y');
					}
					const pageLoadData = {
						selectedCoverType: selectedCoreCoverType,
						selectedCoverLevel: selectedCoreCoverLevel,
						selectedCover,
						selectedCoverExtras,
						price: { ...prices },
						paymentFrequency,
						paymentDetails,
					};
					if (initialLoad) {
						const preSelectedProductData = {
							preSelectedCoverType: selectedCoreCoverType,
							preSelectedCoverLevel: selectedCoreCoverLevel,
							preSelectedCover: selectedCover,
							preSelectedCoverExtras: selectedCoverExtras,
						};
						const deviceType = isMobile() ? 'mobile' : 'desktop';
						Object.assign(pageLoadData, {
							...preSelectedProductData,
							deviceType,
							initialPaymentFrequency: paymentFrequency,
							paymentDetails,
							journeyType: this.journeyType,
							journeySiteName: this.journeySiteName,
						});
					}
					resolve(pageLoadData);
				});
		});
	}

	private initPageChangeListener(): void {
		this.router.events.subscribe((event: Event) => {
			if (event instanceof NavigationEnd && event.urlAfterRedirects !== this.currentRouteUrl) {
				let currentRoute = this.activatedRoute.root;
				while (currentRoute.children[0] !== undefined) {
					currentRoute = currentRoute.children[0];
				}
				const pageName = currentRoute.snapshot.data.AnalyticsPageId;
				const pageType = currentRoute.snapshot.data.type;

				if (pageType !== EStepType.DetailsAndPayment) {
					this.TrackPageLoad(pageName, pageType);
				}

				this.currentRouteUrl = event.urlAfterRedirects;
			}
		});
	}

	public TrackPageLoad(pageName: string, pageType: string): void {
		const analyticsPageName = `${this.analyticsPrefix.toLowerCase()}.${pageName}.${isMobile() ? 'mobile' : 'desktop'}`;
		this.getPageLoadData(!this.appLoaded, pageType).then(pageLoadData => {
			this.analyticsService.trackEvent(analyticsPageName, {
				pageName: analyticsPageName,
				...pageLoadData,
			});
		});

		if (!this.appLoaded) {
			this.appLoaded = true;
		}
	}

	private getCover(products: IProduct[]): string[] {
		return products.map(product => product.ProductCode);
	}

	private getCoverExtras(products: IProduct[]): string[] {
		return products.filter(product => product.CoverOptionsGroup === ECoverOptionsGroup.OptionalExtra).map(product => product.ProductCode);
	}

	private getProductPrefixAndNumber(productCode: string): { productNumber: number; productPrefix: string } {
		// Remove all letters which should provide the product number,
		// if variable is empty then assign 1 as the product number
		const productStringRemove = productCode.replace(/[a-z]/gi, '');
		const productNumber = productStringRemove ? parseInt(productStringRemove, 10) : 1;
		// Remove all numbers and return letters, which should be the prefix.
		const productPrefix = productCode.replace(/[0-9]/g, '');

		return { productNumber, productPrefix };
	}

	public TrackQuestionActivated(state: fromRoot.State, questionId: string): void {
		const progressQuestions = this.getProgressQuestions(state);
		const question = progressQuestions.find(q => q.Id === questionId);

		this.TrackEvent(`QuestionActivated`, {
			activatedQuestionIndex: progressQuestions.indexOf(question),
			activatedQuestionText: question.Title,
		});
	}

	public TrackQuestionAnswered(state: fromRoot.State, questionId: string): void {
		const progressQuestions = this.getProgressQuestions(state);
		const question = progressQuestions.find(q => q.Id === questionId);

		this.TrackEvent(`QuestionAnswered`, {
			answeredQuestionIndex: progressQuestions.indexOf(question) + 1,
			answeredQuestionText: question.Title,
		});
	}

	private getProgressQuestions(state: fromRoot.State): IQuestionState[] {
		return state.questions.questions.filter(q => !q.Hidden);
	}
}
