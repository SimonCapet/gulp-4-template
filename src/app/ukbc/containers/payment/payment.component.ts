import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import { Store } from '@ngrx/store';

import * as fromRoot from 'ukbc/reducers';
import * as cardActions from 'ukbc/actions/card.actions';
import * as paymentActions from 'ukbc/actions/payment.actions';
import { IValidated } from 'shared/models/validation.model';
import { ICard, IJourneyContent, IGeneralContent, IStep } from 'ukbc/models';

import { IInitialState, ICover, ICardStatus, IStepSubtitles, IPaymentOptions, IPrice, IPayment, IPaymentState } from 'ukbc/models';
import {
	EDirectDebitError,
	EPaymentType,
	EPaymentCardType,
	EBaseProductPrefix,
	ESaveCoverSource,
	ECardCategory,
	EPurchaseType,
	EDetailsCardType,
} from 'ukbc/enums';
import { CoverService, PaymentService, ViewportService, CheckoutAnalyticsService } from 'ukbc/services';
import { SectionCardComponent } from 'ukbc/containers/section-card/section-card.component';
import { DirectDebitDetailsComponent } from 'ukbc/components/payment/direct-debit-details.component';
import { CardType } from 'ukbc/models/card.model';
import { take } from 'rxjs/operators';

@Component({
	selector: 'ukbc-payment',
	styleUrls: ['./payment.base.scss'],
	templateUrl: './payment.component.html',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent implements OnInit, OnDestroy {
	@ViewChild('coverStartDate') coverStartDateCard: SectionCardComponent;
	@ViewChild('cardPayment') cardPaymentCard: SectionCardComponent;
	@ViewChild(DirectDebitDetailsComponent) directDebitDetailsComponent: DirectDebitDetailsComponent;
	@ViewChild('paymentDetails') paymentDetailsCard: SectionCardComponent;

	public Content$: Observable<IInitialState>;
	public GeneralContent$: Observable<IGeneralContent>;
	private content: IGeneralContent;
	public JourneyContent: IJourneyContent;
	public ForceShowValidationErrors = false;
	protected displayDirectDebitDetailsInvalidError = false;
	protected displayDirectDebitDetailsServerError = false;
	private agreeToDirectDebitTermsAndConditions: IValidated<boolean>;
	public Payment: IValidated<IPayment>;
	protected cover: IValidated<ICover>;
	public CardStatus$: Observable<ICardStatus>;
	public Pricing$: Observable<IPrice>;
	public Payment$: Observable<IPaymentState>;
	public Cover$: Observable<IValidated<ICover>>;
	public IsRenewal$: Observable<boolean>;

	private cardStatus: ICardStatus;
	public PaymentOptions: IPaymentOptions;
	public IsZeroPayment: boolean;
	private isRenewal: boolean;

	private subscriptions: Subscription[] = [];

	public PaymentOptionsLoading = false;
	public CompletingCard = false;
	public CardTypes = EPaymentCardType;
	public CustomerPaymentInformation: string;
	public CurrentStep$: Observable<IStep>;
	private cards: ICard[];
	private completedCards: string[];

	constructor(
		protected store: Store<fromRoot.State>,
		protected route: ActivatedRoute,
		protected cd: ChangeDetectorRef,
		public CoverService: CoverService,
		protected paymentService: PaymentService,
		protected viewportService: ViewportService,
		protected checkoutAnalyticsService: CheckoutAnalyticsService
	) {
		this.Content$ = store.select(fromRoot.getContent);
		this.GeneralContent$ = store.select(fromRoot.getGeneralContent);

		this.CardStatus$ = store.select(fromRoot.getCardStatus);
		this.Pricing$ = store.select(fromRoot.getPricing);
		this.Payment$ = store.select(fromRoot.getPaymentState);
		this.Cover$ = store.select(fromRoot.getCover);
		this.IsRenewal$ = store.select(fromRoot.getIsRenewal);
		this.CurrentStep$ = store.select(fromRoot.getCurrentStep);
		store
			.select(fromRoot.getCards)
			.pipe(take(1))
			.subscribe(cards => (this.cards = cards));
		store.select(fromRoot.getCompletedCards).subscribe(completedCards => (this.completedCards = completedCards));

		this.IsRenewal$.take(1).subscribe(isRenewal => (this.isRenewal = isRenewal));
	}

	ngOnInit() {
		this.subscriptions.push(
			this.CardStatus$.subscribe(status => {
				this.cardStatus = status;

				this.cd.markForCheck();
			})
		);

		if (this.cardStatus.openCardType && this.cardStatus.openCardType !== EDetailsCardType.Members) {
			const card = this.getCardElement(this.cardStatus.openCardType);

			if (card) {
				setTimeout(() => card.ScrollTo());
			}
		}

		this.subscriptions.push(
			this.Cover$.subscribe(cover => {
				this.cover = cover;
				this.cd.markForCheck();
			})
		);

		this.subscriptions.push(
			this.Pricing$.subscribe(pricing => {
				this.IsZeroPayment = pricing.total === 0 && pricing.totalWithoutDiscount > 0;
				this.cd.markForCheck();
			})
		);

		this.subscriptions.push(
			this.Payment$.subscribe(paymentState => {
				if (this.Payment && this.Payment.model.paymentType !== paymentState.payment.model.paymentType) {
					this.ForceShowValidationErrors = false;
				}
				this.agreeToDirectDebitTermsAndConditions = paymentState.agreeToDirectDebitTermsAndConditions;
				this.Payment = paymentState.payment;
				this.PaymentOptionsLoading = paymentState.optionsLoading;
				this.PaymentOptions = paymentState.options;
				this.cd.markForCheck();
			})
		);

		this.subscriptions.push(
			this.Content$.subscribe(content => {
				this.JourneyContent = content.ContentInformation.Journey;
				this.content = content.ContentInformation.GeneralInfo;

				if (content.ContentInformation.GeneralInfo.CustomerPaymentInformation) {
					this.CustomerPaymentInformation = content.ContentInformation.GeneralInfo.CustomerPaymentInformation;
				}

				this.cd.markForCheck();
			})
		);

		if (this.isRenewal) {
			this.setDefaultPaymentMethod();
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach(s => s.unsubscribe());
	}

	protected getCardElement(cardType: CardType): SectionCardComponent {
		switch (cardType) {
			case EPaymentCardType.CoverStartDate:
				return this.coverStartDateCard;
			case EPaymentCardType.PaymentDetails:
				return this.paymentDetailsCard;
			case EPaymentCardType.CardPayment:
				return this.cardPaymentCard;
		}
	}

	protected isCardValid(type: EPaymentCardType) {
		return new Promise((resolve, reject) => {
			switch (type) {
				case EPaymentCardType.PaymentDetails:
					this.displayDirectDebitDetailsInvalidError = false;
					this.displayDirectDebitDetailsServerError = false;
					if (this.Payment.isValid) {
						if (this.Payment.model.paymentType === EPaymentType.DirectDebit) {
							this.paymentService
								.ValidateDirectDebit(this.Payment.model)
								.then(data => {
									!!data ? resolve() : reject(EDirectDebitError.InvalidDetails);
								})
								.catch(error => {
									if (!error.handled) {
										reject(EDirectDebitError.Generic);
									}
								});
						} else {
							resolve();
						}
					} else {
						reject();
					}
					break;
				case EPaymentCardType.CoverStartDate:
					this.cover.isValid ? resolve() : reject();
					break;
				default:
					resolve();
			}
		});
	}

	public OpenCard(type: EPaymentCardType): void {
		this.checkoutAnalyticsService.TrackSectionEditClicked(type);
		this.store.dispatch(new cardActions.OpenCard(type));
	}

	public CompleteCard(type: EPaymentCardType): void {
		this.CompletingCard = true;
		this.checkoutAnalyticsService.TrackSectionContinueClicked(type);

		this.isCardValid(type)
			.then(() => {
				this.ForceShowValidationErrors = false;
				this.cd.markForCheck();

				if (type === EPaymentCardType.CoverStartDate) {
					this.setDefaultPaymentMethod();
				}

				if (this.shouldSaveCoverOnComplete(type)) {
					return this.CoverService
						.SaveCover(ESaveCoverSource.CheckCardValid, type, () => this.CompleteCard(type))
						.then(() => this.markCardAsComplete(type))
						.catch(error => {
							if (!error.handled) {
								this.cd.markForCheck();
								return Promise.reject(error);
							}
						});
				} else {
					this.markCardAsComplete(type);
				}
			})
			.catch(error => {
				this.CompletingCard = false;
				this.ForceShowValidationErrors = true;
				this.cd.markForCheck();
				if (error) {
					switch (error) {
						case EDirectDebitError.InvalidDetails:
							this.displayDirectDebitDetailsInvalidError = true;
							this.scrollToFirstError();
							break;
						case EDirectDebitError.Generic:
							this.displayDirectDebitDetailsServerError = true;
							this.scrollToFirstError();
							break;
						case EDirectDebitError.Terms:
							this.viewportService.ScrollToElement(<HTMLElement>this.directDebitDetailsComponent.termsComponent.ElementRef.nativeElement);
							break;
						default:
							setTimeout(() => this.getCardElement(this.cardStatus.openCardType).ScrollTo(), 0);
					}
				} else {
					// Inline Error
					setTimeout(() => this.scrollToFirstError(), 0);
				}
			});
	}

	protected shouldSaveCoverOnComplete(cardType: EPaymentCardType): boolean {
		// Slice creates a copy of the array so we don't change the original
		const reversedCards = this.cards.slice().reverse();
		// Remove the payment card from the array and then find the last card which is not visible or readonly.
		const lastVisibleCard = reversedCards.slice(1).find(card => card.visible && !card.readonly && !this.completedCards.includes(card.type));
		// If the last card is the current card then we should move to payment otherwise continue as normal.
		return !lastVisibleCard || lastVisibleCard.type === cardType;
	}

	private markCardAsComplete(type: EPaymentCardType): void {
		this.CompletingCard = false;
		this.store.dispatch(new cardActions.CompleteCard(type));
	}

	protected setDefaultPaymentMethod(): void {
		if (this.Payment.model.paymentType === null) {
			this.store.dispatch(new paymentActions.SetPaymentMethodAction());
		}
	}

	public IsCardOpen(cardType: EPaymentCardType): boolean {
		return this.cardStatus.openCardType === cardType;
	}

	public IsCardComplete(cardType: EPaymentCardType): boolean {
		return this.cardStatus.completedCardTypes.includes(cardType);
	}

	private scrollToFirstError(): void {
		this.viewportService.ScrollToElement(<HTMLElement>document.querySelector('.js-invalid-input'), true);
	}

	public ShowDirectDebitSection(): Observable<boolean> {
		return this.Payment$
			.map(({ payment }) => {
				return payment.model.paymentType === EPaymentType.DirectDebit;
			})
			.map(result => !!result);
	}

	public ShowCardIframe(): Observable<boolean> {
		return this.Payment$
			.map(({ options, optionsLoading }) => {
				return !!options && !optionsLoading;
			})
			.map(result => !!result);
	}

	public PaymentTypeSelected(): Observable<boolean> {
		return this.Payment$
			.map(({ payment }) => {
				return !!payment.model.paymentType;
			})
			.map(result => !!result);
	}

	public CardPaymentCardTitle(): Observable<string> {
		return this.Payment$
			.map(paymentState => {
				return paymentState.payment.model.purchaseType === EPurchaseType.Annual;
			})
			.switchMap(isAnnual => {
				return this.GeneralContent$.map(content => {
					return isAnnual ? content.CardPaymentAnnualLabel : content.CardPaymentMonthlyLabel;
				});
			});
	}

	public checkIsReadonly(type): boolean {
		return !!this.cards.find(card => card.type === type && card.readonly);
	}

	public get IsLCPJourney() {
		return this.JourneyContent.CoreProductCode === EBaseProductPrefix.LCP;
	}

	public get IsPayingByCard() {
		return this.Payment.model.paymentType === EPaymentType.DebitCard || this.Payment.model.paymentType === EPaymentType.CreditCard;
	}

	public get DisplayCancellationMessage(): boolean {
		return Boolean(this.CancellationMessage);
	}

	public get AnnualSelected(): boolean {
		return this.Payment.model.purchaseType === EPurchaseType.Annual;
	}

	public get CancellationMessage(): string {
		return this.Payment.model.purchaseType === EPurchaseType.Monthly
			? this.JourneyContent.MonthlyCancellationMessage
			: this.JourneyContent.AnnualCancellationMessage;
	}
}
