import { Output, OnInit, OnDestroy, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { IAnnualAndMonthly, IGeneralContent, IPaymentState } from 'ukbc/models';
import { IJourneyContent } from 'ukbc/models/content.model';
import { EPurchaseType } from 'ukbc/enums';
import * as fromRoot from 'ukbc/reducers';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { EPolicyDuration } from 'ukbc/enums/policyDuration.enum';

const UUID = require('uuid/v4');

export class PaymentFrequency implements OnInit, OnDestroy {
	@Output() onFocus = new EventEmitter<FocusEvent>();

	content$: Observable<IGeneralContent>;

	public UUID = UUID();

	private payment$: Observable<IPaymentState>;
	private paymentSubscription: Subscription;
	private frequency$: Observable<EPurchaseType>;
	private frequencySubscription: Subscription;
	public Frequency: EPurchaseType;
	public Duration: EPolicyDuration;
	private duration$: Observable<EPolicyDuration>;
	private durationSubscription: Subscription;
	public EPurchaseType = EPurchaseType;
	public EPolicyDuration = EPolicyDuration;
	private pricing$: Observable<IAnnualAndMonthly>;
	private pricingSubscription: Subscription;
	public CanChangeFrequency$: Observable<boolean>;
	public AnnualTotal: number;
	public MonthlyTotal: number;
	public TwoYearTotal: number;
	public JourneyContent: IJourneyContent;
	public AnnualLabel: string;
	public PerYearLabel: string;
	public MonthlyLabel: string;
	public PerMonthLabel: string;
	public MonthlyDiscountedInstallmentFrequencyText: string;
	public MonthlyDiscountedInstallmentSuffix: string;
	public PolicyDetailsLabel: string;
	public TwoYearPolicyMessage: string;
	public PolicyDetailsTellMeMoreLabel: string;
	public PolicyDetailsTellMeMoreInfo: string;
	public PolicyDetailsOneYearLabel: string;
	public PolicyDetailsTwoYearLabel: string;

	constructor(
		private store: Store<fromRoot.State>,
		private cd: ChangeDetectorRef,
		private checkoutAnalyticsService: CheckoutAnalyticsService,
		private getPricing = false
	) {
		this.frequency$ = store.select(fromRoot.getFrequency);
		this.duration$ = store.select(fromRoot.getDuration);
		this.CanChangeFrequency$ = store.select(fromRoot.getCanChangePaymentFrequency);

		if (getPricing) {
			this.pricing$ = store.select(fromRoot.getAnnualAndMonthlyPricing);
			this.content$ = store.select(fromRoot.getGeneralContent);
			this.payment$ = store.select(fromRoot.getPaymentState);
		}
	}

	ngOnInit(): void {
		this.frequencySubscription = this.frequency$.subscribe(f => (this.Frequency = f));
		this.durationSubscription = this.duration$.subscribe(d => (this.Duration = d));

		this.store
			.select(fromRoot.getGeneralContent)
			.take(1)
			.subscribe(c => {
				this.AnnualLabel = c.AnnualLabel;
				this.PerYearLabel = c.ProductAnnualLabel;
				this.MonthlyLabel = c.MonthlyLabel;
				this.PerMonthLabel = c.ProductMonthlyLabel;
				this.PolicyDetailsLabel = c.PolicyDetailsLabel;
				this.PolicyDetailsTellMeMoreLabel = c.PolicyDetailsTellMeMoreLabel;
				this.PolicyDetailsTellMeMoreInfo = c.PolicyDetailsTellMeMoreInfo;
				this.PolicyDetailsOneYearLabel = c.PolicyDetailsOneYearLabel;
				this.PolicyDetailsTwoYearLabel = c.PolicyDetailsTwoYearLabel;
			});

		this.store
			.select(fromRoot.getJourneyContent)
			.take(1)
			.subscribe(content => {
				this.JourneyContent = content;
			});

		if (this.getPricing) {
			this.pricingSubscription = this.pricing$.subscribe(p => {
				this.AnnualTotal = p.annual;
				this.MonthlyTotal = p.monthly;
				this.TwoYearTotal = p.twoYear;
				this.cd.markForCheck();
			});

			this.paymentSubscription = this.payment$.subscribe(paymentState => {
				this.MonthlyDiscountedInstallmentFrequencyText = paymentState.options
					? paymentState.options.MonthlyDiscountedInstallmentFrequencyText
					: '';
				this.MonthlyDiscountedInstallmentSuffix = paymentState.options ? paymentState.options.MonthlyDiscountedInstallmentSuffix : '';
				this.TwoYearPolicyMessage = paymentState.options ? paymentState.options.TwoYearPolicyMessage : '';
				this.cd.markForCheck();
			});
		}
	}

	ngOnDestroy(): void {
		this.frequencySubscription.unsubscribe();
		this.durationSubscription.unsubscribe();

		if (this.getPricing) {
			this.pricingSubscription.unsubscribe();
			this.paymentSubscription.unsubscribe();
		}
	}

	public DisplayFrequency(frequency: EPurchaseType): boolean {
		return !this.JourneyContent.SinglePaymentFrequencyAvailable || this.Frequency === frequency;
	}

	public SetFrequency(frequency: EPurchaseType): void {
		this.store.dispatch(new pricingActions.BeginSetFrequencyAction(frequency));
	}

	public ToggleFrequency(frequency: EPurchaseType, event?: Event): void {
		setTimeout(() => {
			this.checkoutAnalyticsService.UpdatePaymentFrequency(frequency);
			this.checkoutAnalyticsService.TrackBasketFrequencyToggleClicked(frequency);
			this.SetFrequency(frequency);
		}, 0);
		if (event) {
			event.preventDefault();
		}
	}

	public ToggleDuration(duration: EPolicyDuration, event?: Event): void {
		setTimeout(() => {
			this.checkoutAnalyticsService.UpdatePolicyDuration(duration);
			this.checkoutAnalyticsService.TrackBasketDurationToggleClicked(duration);
			this.store.dispatch(new pricingActions.SetPolicyDurationAction(duration));
		}, 0);
		if (event) {
			event.preventDefault();
		}
	}

	public HandleRadioKeyup(event$: KeyboardEvent): void {
		if (event$.keyCode === 13 || event$.keyCode === 32) {
			event$.preventDefault();
			switch (this.Frequency) {
				case EPurchaseType.Monthly:
					this.ToggleFrequency(EPurchaseType.Annual);
					break;
				case EPurchaseType.Annual:
					this.ToggleFrequency(EPurchaseType.Monthly);
					break;
			}
		}
	}
}
