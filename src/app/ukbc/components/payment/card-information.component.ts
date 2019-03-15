import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { IGeneralContent, IJourneyContent, IPayment, IPaymentOptions, IPaymentState } from 'ukbc/models';
import { EPurchaseType } from 'ukbc/enums';
import { getOrdinalSuffixOf } from 'scripts/utils';

@Component({
	selector: 'ukbc-card-information',
	templateUrl: './card-information.component.html',
})
export class CardInformationComponent implements OnChanges {
	public EPurchaseType = EPurchaseType;

	@Input() isOpen: boolean;
	@Input() isComplete: boolean;
	@Input() forceShowValidationErrors = false;
	@Input() content: IGeneralContent;
	@Input() journeyContent: IJourneyContent;
	@Input() paymentOptions: IPaymentOptions;
	@Input() payment: IPayment;
	@Input() purchaseType: EPurchaseType;
	@Input() loading: boolean;
	@Input() isZeroPayment: boolean;
	@Output() onComplete = new EventEmitter<string>();

	public SaveButtonText: string;

	ngOnChanges(changes: SimpleChanges) {
		if (this.inputChanged(changes.purchaseType) || this.inputChanged(changes.isZeroPayment)) {
			this.setSaveButtonText();
		}
	}

	private inputChanged(change: SimpleChange): boolean {
		return change && (!change.previousValue || change.previousValue !== change.currentValue);
	}

	public SaveCardDetails(): void {
		this.onComplete.emit();
	}

	public get InstalmentDate(): string {
		return getOrdinalSuffixOf(parseInt(this.payment.collectionDate, 10));
	}

	private setSaveButtonText(): void {
		if (this.isZeroPayment) {
			this.SaveButtonText = this.content.SavePaymentMethodZeroPayment;
		} else if (this.purchaseType === EPurchaseType.Monthly) {
			this.SaveButtonText = this.content.SavePaymentMethodMonthlyCard;
		} else {
			this.SaveButtonText = this.content.SavePaymentMethodAnnualCard;
		}
	}
}
