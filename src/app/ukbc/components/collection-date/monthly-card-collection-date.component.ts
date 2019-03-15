import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import { SetCollectionDate } from 'ukbc/actions';
import { ICollectionDate } from 'ukbc/components/collection-date/collection-date.component';
import { IDateFormat } from 'shared/models';
import { IGeneralContent, IPaymentOptions } from 'ukbc/models';

@Component({
	selector: 'ukbc-monthly-card-collection-date',
	templateUrl: './monthly-card-collection-date.component.html',
})
export class MonthlyCardCollectionDateComponent {
	@Input() content: IGeneralContent;
	@Input() paymentOptions: IPaymentOptions;
	@Input() forceShowValidationErrors = false;

	public CollectionDate$: Observable<string>;
	public NUMBER_OF_DAYS_AFTER_START_DATE_UNTIL_FIRST_AVAILABLE_COLLECTION_DATE_FOR_CARD = 12;

	private firstInstalmentDate: string;
	private instalmentDateFormat: IDateFormat = { year: 'numeric', month: 'long', day: 'numeric' };

	constructor(private store: Store<fromRoot.State>) {
		this.CollectionDate$ = store.select(fromRoot.getCollectionDate);
	}

	public OnDateChanged(collectionDate: ICollectionDate): void {
		this.store.dispatch(new SetCollectionDate(collectionDate.number.toString()));

		this.firstInstalmentDate = collectionDate.date.toLocaleDateString('en-GB', this.instalmentDateFormat);
	}

	public get CollectionDateInstalmentHelpText() {
		return `${this.content.CollectionDateHelpPrefix} <strong>${this.firstInstalmentDate}</strong> ${this.content.CollectionDateHelpSuffix}`;
	}

	public get MonthlyOnCardPaymentDescription(): string {
		const paymentOptions = this.paymentOptions;
		return paymentOptions && paymentOptions.MonthlyOnCardPaymentDescription ? paymentOptions.MonthlyOnCardPaymentDescription : '';
	}
}
