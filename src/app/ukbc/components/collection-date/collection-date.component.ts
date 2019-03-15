import { Component, OnInit, OnDestroy, Input, ViewEncapsulation, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/take';
import { sortBy } from 'sort-by-typescript';

import * as fromRoot from 'ukbc/reducers';
import { IGeneralContent, IPaymentOptions } from 'ukbc/models';
import { ISelectOption, IValidationError, IDateFormat } from 'shared/models';
import { SetCollectionDate } from 'ukbc/actions';
import { getOrdinalSuffixOf } from 'scripts/utils';
import { EPaymentType } from 'ukbc/enums';

const MAX_MONTH_DAY = 28;
const NUMBER_OF_DAYS_BETWEEN_FINAL_INSTALMENT_AND_RENEWAL = 20;

export interface ICollectionDate {
	number: number;
	date: Date;
}
@Component({
	selector: 'ukbc-collection-date',
	templateUrl: './collection-date.component.html',
	styleUrls: ['./collection-date.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class CollectionDateComponent implements OnInit, OnDestroy, OnChanges {
	@Input() collectionDate: string;
	@Input() forceShowValidationErrors = false;
	@Input() daysAfterStartDateUntilFirstAvailableCollectionDate: number;
	@Input() numberOfInstalments = 11;
	@Input() paymentOptions: IPaymentOptions;
	@Input() content: IGeneralContent;

	@Output() onCollectionDateChange = new EventEmitter<ICollectionDate>();

	public CollectionDates: ISelectOption[] = [];
	public Errors: IValidationError[];

	private subscriptions: Subscription[] = [];
	private availableCollectionDates: ICollectionDate[] = [];

	constructor(private store: Store<fromRoot.State>) {}

	ngOnInit() {
		this.subscriptions.push(this.store.select(fromRoot.getCoverStartDate).subscribe(this.setCollectionDates.bind(this)));
		this.subscriptions.push(
			this.store.select(fromRoot.getPaymentValidationErrors).subscribe(errors => (this.Errors = errors.collectionDate))
		);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		this.subscriptions = [];
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.numberOfInstalments || changes.daysAfterStartDateUntilFirstAvailableCollectionDate) {
			this.store
				.select(fromRoot.getCoverStartDate)
				.take(1)
				.subscribe(this.setCollectionDates.bind(this));
		}
	}

	private setCollectionDates(coverStartDate: string): void {
		if (!isNaN(Date.parse(coverStartDate))) {
			const startDate = new Date(coverStartDate);
			const renewalDate = new Date(coverStartDate);
			renewalDate.setFullYear(renewalDate.getFullYear() + 1);

			// Calculate the first day an instalment can be made
			let firstAvailableCollectionDate = new Date(startDate);
			firstAvailableCollectionDate.setDate(
				firstAvailableCollectionDate.getDate() + this.daysAfterStartDateUntilFirstAvailableCollectionDate
			);

			// Run first available collection date through checker to make sure it's not greater than MAX_MONTH_DAY.
			firstAvailableCollectionDate = this.resetDateIfGreaterThanMax(firstAvailableCollectionDate);

			// Calculate the last day an instalment can be made
			const latestCollectionDate = new Date(renewalDate);
			latestCollectionDate.setDate(latestCollectionDate.getDate() - NUMBER_OF_DAYS_BETWEEN_FINAL_INSTALMENT_AND_RENEWAL - 1);

			const availableCollectionDates: Date[] = [firstAvailableCollectionDate];

			for (let i = 1; i < MAX_MONTH_DAY; i++) {
				let date = new Date(availableCollectionDates[i - 1]);
				date.setDate(date.getDate() + 1);

				// If the date is 29, 30, or 31 set back to 1 and move to the next month
				date = this.resetDateIfGreaterThanMax(date);

				// Calculate what the final instalment date would be
				const finalCollectionDate = new Date(date);
				finalCollectionDate.setMonth(finalCollectionDate.getMonth() + this.numberOfInstalments - 1);

				// Collection date is only available if final instalment date is less than or equal to
				// latest instalment date
				if (finalCollectionDate <= latestCollectionDate) {
					availableCollectionDates.push(date);
				}
			}

			// Creating the dropdown options
			this.CollectionDates = availableCollectionDates.map(
				date => <ISelectOption>{ value: date.getDate(), text: getOrdinalSuffixOf(date.getDate()) }
			);

			// If the instalment date that comes from the store isn't in the dates array or it's empty,
			// then set the collection date to the 1st of the month
			this.availableCollectionDates = availableCollectionDates.map(d => <any>{ date: d, number: d.getDate() }).sort(sortBy('number'));

			if (!this.availableCollectionDates.find(d => d.number === parseInt(this.collectionDate, 10))) {
				this.onCollectionDateChange.emit(this.availableCollectionDates[0]);
			} else {
				const fullDate = this.availableCollectionDates.find(d => d.number.toString() === this.collectionDate);
				this.onCollectionDateChange.emit(fullDate);
			}
		}
	}

	public InputChanged($event): void {
		const fullDate = this.availableCollectionDates.find(d => d.number.toString() === $event.value);
		this.onCollectionDateChange.emit(fullDate);
	}

	// Function to make sure date is not greater than MAX_MONTH_DAY.
	// If the date is 29, 30, or 31 set back to 1 and move to the next month
	private resetDateIfGreaterThanMax(date) {
		if (date.getDate() > MAX_MONTH_DAY) {
			date.setDate(1);
			date.setMonth(date.getMonth() + 1);
		}
		return date;
	}
}
