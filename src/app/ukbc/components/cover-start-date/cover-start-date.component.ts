import { Component, Input, Output, OnInit, OnDestroy, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import classNames from 'classnames';
import * as coverActions from 'ukbc/actions/cover.actions';
import * as fromRoot from 'ukbc/reducers';
import { IValidationError } from 'shared/models';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { ECoverStartDateValue } from 'ukbc/enums';
import { IGeneralContent } from 'ukbc/models/content.model';

export interface CoverDateObject {
	label: ECoverStartDateValue;
	date: Date;
}

@Component({
	selector: 'ukbc-payment-cover-start-date',
	templateUrl: './cover-start-date.component.html',
	styleUrls: ['./cover-start-date.component.scss'],
})
export class PaymentCoverStartDateComponent implements OnInit, OnDestroy {
	@Input() isOpen: boolean;
	@Input() isComplete: boolean;
	@Input() forceShowValidationErrors: boolean;
	@Input() isRenewal: boolean;
	@Input() isReadonly: boolean;
	@Input() TodayOnly: boolean;
	@Output() setCoverStartDate = new EventEmitter<Date>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onOpen = new EventEmitter<void>();
	@Output() onComplete = new EventEmitter<void>();

	classNames = classNames;

	public AnotherDate: Date;
	public TodayDate: Date;
	public TomorrowDate: Date;
	public StartDate: Date;
	public TodayLabel: string;
	public TomorrowLabel: string;
	public AnotherDateLabel: string;
	public CoverDateSelected: ECoverStartDateValue;
	public ValidationErrors$: Observable<IValidationError[]>;
	public Content: IGeneralContent;
	public ECoverStartDateValue = ECoverStartDateValue;

	private ContentSubscription: Subscription;

	constructor(
		private store: Store<fromRoot.State>,
		private checkoutAnalyticsService: CheckoutAnalyticsService,
		private cd: ChangeDetectorRef
	) {
		this.ValidationErrors$ = store.select(fromRoot.getCover).map(state => state.validationErrors.StartDate);
	}

	ngOnInit(): void {
		this.ContentSubscription = this.store.select(fromRoot.getGeneralContent).subscribe(content => {
			this.Content = content;
			this.TodayLabel = this.Content.TodayLabel;
			this.TomorrowLabel = this.Content.TomorrowLabel;
			this.AnotherDateLabel = this.Content.AnotherDateLabel;
		});

		this.store
			.select(fromRoot.getCover)
			.map(state => state.model.StartDate)
			.subscribe(date => {
				date = new Date(date);
				// Set date values
				this.TodayDate = this.newDate;
				this.TomorrowDate = new Date(this.newDate.setDate(this.newDate.getDate() + 1));
				this.AnotherDate = new Date(this.newDate.setDate(this.newDate.getDate() + 2));

				// If the date passed from the state is not today or tomorrow then
				// set it to another date.
				if (
					this.dateValid(date) &&
					(this.dateToStringHelper(date) !== this.dateToStringHelper(this.TodayDate) &&
						this.dateToStringHelper(date) !== this.dateToStringHelper(this.TomorrowDate))
				) {
					this.AnotherDate = date;
				}

				this.StartDate = date;
			});

		// Default to another date button
		this.CoverDateSelected = ECoverStartDateValue.AnotherDate;

		if (this.dateValid(this.StartDate) && this.dateToStringHelper(this.StartDate) === this.dateToStringHelper(this.TodayDate)) {
			this.CoverDateSelected = ECoverStartDateValue.Today;
		}

		if (this.dateValid(this.StartDate) && this.dateToStringHelper(this.StartDate) === this.dateToStringHelper(this.TomorrowDate)) {
			this.CoverDateSelected = ECoverStartDateValue.Tomorrow;
		}
	}

	ngOnDestroy() {
		this.ContentSubscription.unsubscribe();
	}

	public SetCoverStartDate(date: Date): void {
		this.checkoutAnalyticsService.UpdateCoverStartDate(date);
		this.store.dispatch(new coverActions.SetCoverStartDateAction(date));
	}

	public UpdateCoverStartDate(CoverStartDate: CoverDateObject) {
		this.checkoutAnalyticsService.UpdateCoverStartDate(CoverStartDate.date);
		this.CoverDateSelected = CoverStartDate.label;
		this.store.dispatch(new coverActions.SetCoverStartDateAction(CoverStartDate.date));
		this.cd.markForCheck();
	}

	public Open() {
		this.onOpen.emit();
	}

	public SaveStartDate() {
		this.onComplete.emit();
	}

	private dateToStringHelper(date) {
		return date
			.toISOString()
			.slice(0, 10)
			.replace(/-/g, '');
	}

	private get newDate() {
		return new Date();
	}

	private dateValid(date) {
		return !isNaN(Date.parse(date.toDateString()));
	}
}
