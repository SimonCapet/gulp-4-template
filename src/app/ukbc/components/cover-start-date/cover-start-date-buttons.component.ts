import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import classNames from 'classnames';
import { ECoverStartDateValue } from 'ukbc/enums';
import { CoverDateObject } from 'ukbc/components/cover-start-date/cover-start-date.component';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-cover-start-date-buttons',
	templateUrl: './cover-start-date-buttons.component.html',
	styleUrls: ['./cover-start-date-buttons.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PaymentCoverStartDateButtonsComponent {
	public ECoverStartDateValue = ECoverStartDateValue;

	@Input() public TodayLabel: string;
	@Input() public TomorrowLabel: string;
	@Input() public AnotherDateLabel: string;
	@Input() public TodayDate: Date;
	@Input() public TomorrowDate: Date;
	@Input() public AnotherDate: Date;
	@Input() public TodayOnly: boolean;
	@Input() private coverDateSelected: ECoverStartDateValue;
	@Output() private dateSelected = new EventEmitter<CoverDateObject>();

	constructor(private analyticsService: CheckoutAnalyticsService) {}

	public get ButtonClassToday(): string {
		return classNames({
			'Btn--green Btn--tick': this.coverDateSelected === ECoverStartDateValue.Today,
			'Btn--white Btn--circle': this.coverDateSelected !== ECoverStartDateValue.Today,
		});
	}

	public get ButtonClassTomorrow(): string {
		return classNames({
			'Btn--white Btn--circle': this.coverDateSelected !== ECoverStartDateValue.Tomorrow,
			'Btn--green Btn--tick': this.coverDateSelected === ECoverStartDateValue.Tomorrow,
		});
	}

	public get ButtonClassAnother(): string {
		return classNames({
			'Btn--white Btn--circle': this.coverDateSelected !== ECoverStartDateValue.AnotherDate,
			'Btn--green Btn--tick': this.coverDateSelected === ECoverStartDateValue.AnotherDate,
		});
	}

	public SetCoverDate(coverStartDateValue: ECoverStartDateValue, date: Date) {
		this.coverDateSelected = coverStartDateValue;
		this.dateSelected.emit({ label: coverStartDateValue, date });

		this.analyticsService.TrackEvent(`FormFieldCoverStartDate${coverStartDateValue}Clicked`);
	}
}
