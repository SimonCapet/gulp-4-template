import { Component, Input, Output, EventEmitter, ElementRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Contact, IContactFields, IGeneralContent, IJourneyContent } from 'ukbc/models';
import { ISelectOption } from 'shared/models';
import * as fromRoot from 'ukbc/reducers';
import { IValidated } from 'shared/models/validation.model';
import classNames from 'classnames';
import { ViewportService } from 'ukbc/services';
import { CheckoutAnalyticsService } from 'ukbc/services/checkout-analytics.service';
import { getOrdinalSuffixOf } from 'scripts/utils/getOrdinalSuffixOf.util';

@Component({
	selector: 'ukbc-details-person',
	templateUrl: './person.component.html',
})
export class DetailsPersonComponent implements OnInit, OnChanges {
	@Input() contact: IValidated<Contact>;
	@Input() isOpen: boolean;
	@Input() isContactOpen = true;
	@Input() isContactComplete = false;
	@Input() index: number;
	@Input() forceShowValidationErrors = false;
	@Input() canRemove = true;
	@Input() dataHandlingLinkLabel: string;
	@Input() shouldShowDataHandlingLink: boolean;

	@Output() setField = new EventEmitter<IContactFields>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onSaveContact = new EventEmitter<Contact>();
	@Output() onEditContact = new EventEmitter<Contact>();
	@Output() showDataHandlingDialog = new EventEmitter();

	public Salutations: ISelectOption[];
	public Content$: Observable<IGeneralContent>;
	public JourneyContent$: Observable<IJourneyContent>;
	public IsRenewal$: Observable<boolean>;
	public componentID: number;

	constructor(
		private store: Store<fromRoot.State>,
		private elementRef: ElementRef,
		private viewportService: ViewportService,
		private checkoutAnalyticsService: CheckoutAnalyticsService
	) {
		this.Content$ = store.select(fromRoot.getGeneralContent);
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
		this.IsRenewal$ = store.select(fromRoot.getIsRenewal);
		this.Salutations = [{ value: 'Mr' }, { value: 'Miss' }, { value: 'Mrs' }, { value: 'Ms' }, { value: 'Sir' }, { value: 'Dr' }];
	}

	ngOnInit() {
		this.componentID = new Date().getUTCMilliseconds();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (
			changes.isContactOpen &&
			!changes.isContactOpen.firstChange &&
			!changes.isContactOpen.previousValue &&
			changes.isContactOpen.currentValue
		) {
			setTimeout(() => this.ScrollToPerson(), 0);
		}
	}

	public get Contact() {
		return this.contact;
	}

	public get ValidationErrors() {
		return this.contact.validationErrors;
	}

	public RemoveContact($event, index: number) {
		$event.preventDefault();
		this.checkoutAnalyticsService.TrackSectionRemove(`${getOrdinalSuffixOf(this.index + 2)}MemberDetails`);
	}

	public EditContact(Contact: Contact) {
		this.checkoutAnalyticsService.TrackSectionEditClicked(`${getOrdinalSuffixOf(this.index + 2)}MemberDetails`);
		this.onEditContact.emit(Contact);
		this.ScrollToPerson();
	}

	public SaveContact(Contact: Contact): void {
		this.checkoutAnalyticsService.TrackSectionSaveDetails(`${getOrdinalSuffixOf(this.index + 1)}MemberDetails`);
		this.onSaveContact.emit(Contact);
	}

	public get PersonClasses() {
		return classNames({
			'CardForm--open': this.isContactOpen,
			'CardForm--complete': this.isContactComplete,
			'CardForm--incomplete': !this.isContactOpen && !this.isContactComplete,
		});
	}

	private ScrollToPerson(): void {
		this.viewportService.ScrollToElement(<HTMLElement>this.elementRef.nativeElement);
	}

	public TrackingFieldName(fieldName: string): string {
		return this.index === 0 ? `LeadMember${fieldName}` : `AdditionalMember${this.index + 1}${fieldName}`;
	}
}
