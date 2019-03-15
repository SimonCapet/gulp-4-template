import { Component, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { IValidated } from 'shared/models/validation.model';
import { IPaymentState, IPayment, IGeneralContent, IDialog, IPaymentOptions } from 'ukbc/models';
import { EPurchaseType } from 'ukbc/enums';

import { getPaymentState, State } from 'ukbc/reducers';
import { SetDirectDebitPaymentField, SetDirectDebitAgreeToTerms, SetCollectionDate } from 'ukbc/actions/payment.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import { DirectDebitTermsComponent } from 'ukbc/components/payment/direct-debit-terms.component';

import * as fromRoot from 'ukbc/reducers';
import { getOrdinalSuffixOf } from 'scripts/utils/getOrdinalSuffixOf.util';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { IDateFormat } from 'shared/models';
import { DirectDebitGuaranteeDialogComponent } from 'ukbc/components/payment/direct-debit-guarantee-dialog.component';
import { ICollectionDate } from 'ukbc/components/collection-date/collection-date.component';

@Component({
	selector: 'ukbc-direct-debit-details',
	templateUrl: './direct-debit-details.component.html',
	styleUrls: ['./direct-debit-details.component.scss'],
})
export class DirectDebitDetailsComponent implements OnInit, OnDestroy {
	@Input() isOpen: boolean;
	@Input() isComplete: boolean;
	@Input() forceShowValidationErrors = false;
	@Input() displayDirectDebitDetailsInvalidError = false;
	@Input() displayDirectDebitDetailsServerError = false;
	@Output() onComplete = new EventEmitter<string>();
	@Input() loading = false;
	@Input() content: IGeneralContent;
	@Input() ShowAFFMessage: boolean;
	@Input() PaymentOptions: IPaymentOptions;
	@Input() ShowCoverCheckMessage: boolean;

	sortCode: number;
	accountName = '';
	paymentFrequency: string;
	private subscriptions: Subscription[] = [];
	private coverStartDate: Date | null = null;
	PaymentState$: Observable<IPaymentState>;
	public PaymentDetails: IValidated<IPayment>;
	private dialogs$: Observable<IDialog[]>;
	private dialogsSubscription: Subscription;
	@ViewChild(DirectDebitTermsComponent) termsComponent;

	public firstCollectionDate: string;
	private collectionDateFormat: IDateFormat = { year: 'numeric', month: 'long', day: 'numeric' };

	public PurchaseType = EPurchaseType;

	constructor(private store: Store<State>, public ElementRef: ElementRef, private checkoutAnalyticsService: CheckoutAnalyticsService) {
		this.PaymentState$ = store.select(getPaymentState);
		this.dialogs$ = store.select(fromRoot.getDialogs);
	}

	ngOnInit() {
		this.subscriptions.push(this.PaymentState$.subscribe(paymentState => (this.PaymentDetails = paymentState.payment)));
		this.subscriptions.push(this.store.select(fromRoot.getCoverStartDate).subscribe(startDate => (this.coverStartDate = startDate)));

		this.store.dispatch(
			new dialogActions.CreateDialogAction({
				id: 'dd-guarantee',
				component: DirectDebitGuaranteeDialogComponent,
				componentInputs: {
					content: this.content.DDGuaranteeHTML,
					printLinkLabel: this.content.DirectDebitGuaranteePrintLinkLabel,
				},
				open: false,
			})
		);

		this.dialogsSubscription = this.dialogs$.subscribe(m => {
			const ddDialog = m.find(dialog => dialog.id === 'dd-guarantee');
			if (ddDialog.open) {
				setTimeout(() => {
					const element = document.getElementById('dd-guarantee');
					const links = [].slice.call(element.getElementsByTagName('a'));
					if (links && links.length) {
						links.forEach(linkElement => linkElement.addEventListener('click', this.handleDirectDebitLinkClick.bind(this)));
					}
				}, 0);
			}
		});
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		this.subscriptions = [];
	}

	public setAgreeToDirectDebitTerms(preference: boolean) {
		this.checkoutAnalyticsService.TrackAgreeToDirectDebitTerms(preference);
		this.store.dispatch(new SetDirectDebitAgreeToTerms(preference));
	}

	public setDirectDebitField(eventData: { field: string; value: string }) {
		this.displayDirectDebitDetailsInvalidError = false;
		this.store.dispatch(new SetDirectDebitPaymentField(eventData));
	}

	public get ValidationErrors() {
		return this.PaymentDetails.validationErrors;
	}

	public DDGuarantee(): void {
		this.checkoutAnalyticsService.TrackEvent('FormFieldClicked', { fieldName: 'Direct debit instructions and guarantee' });
		this.store.dispatch(new dialogActions.OpenDialogAction({ id: 'dd-guarantee' }));
	}

	private handleDirectDebitLinkClick(event): void {
		const link = event.target.href;
		let fieldName: string;

		if (link.includes('tel:')) {
			fieldName = 'TelNumberDDInstructionsGuarantee';
		} else if (link.includes('mailto:')) {
			fieldName = 'EmailLinkDDInstructionsGuarantee';
		}

		this.checkoutAnalyticsService.TrackEvent('FormFieldClicked', { fieldName });
	}

	public get DirectDebitMessage(): string {
		return !this.PaymentOptions
			? ''
			: this.IsAnnual
				? this.PaymentOptions.DirectDebitModel.AnnualDirectDebitMessage
				: this.PaymentOptions.DirectDebitModel.MonthlyDirectDebitMessage;
	}

	public get AAFMessageToDisplay(): string {
		return !this.PaymentOptions ? '' : this.PaymentOptions.AAFMessageToDisplay;
	}

	public get IsAnnual(): boolean {
		return this.PaymentDetails.model.purchaseType === EPurchaseType.Annual;
	}

	public get FirstCollectionDateHelpText() {
		return this.IsAnnual && this.content.AnnualCollectionDateHelpPrefix
			? this.content.AnnualCollectionDateHelpPrefix +
					` <strong>${this.firstCollectionDate}</strong> ${this.content.AnnualCollectionDateHelpSuffix}`
			: this.content.CollectionDateHelpPrefix + ` <strong>${this.firstCollectionDate}</strong> ${this.content.CollectionDateHelpSuffix}`;
	}

	public get InstalmentDateNumber(): string {
		return getOrdinalSuffixOf(Number(this.PaymentDetails.model.collectionDate));
	}

	public onCollectionDateSet(collectionDate: ICollectionDate) {
		this.firstCollectionDate = collectionDate.date.toLocaleDateString('en-GB', this.collectionDateFormat);
		this.store.dispatch(new SetCollectionDate(collectionDate.number.toString()));
	}
}
