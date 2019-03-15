import { IPaymentState, IInitialState, IGeneralContent, IJourneyContent } from 'ukbc/models';
import { EPurchaseType } from 'ukbc/enums';
import { ValidatePayment } from 'ukbc/reducers/payment/validate-payment.util';

const { AnnualFrequencyPaymentTypes, MonthlyFrequencyPaymentTypes } = <IJourneyContent>(<IInitialState>(<any>window).UKBC_initialState)
	.ContentInformation.Journey;

export function SetPurchaseType(state: IPaymentState, type: EPurchaseType): IPaymentState {
	const newState = { ...state };
	newState.payment.model.purchaseType = type;

	newState.availablePaymentTypes = type === EPurchaseType.Annual ? AnnualFrequencyPaymentTypes : MonthlyFrequencyPaymentTypes;

	// When switching from Annual to Monthly and vice versa in the basket
	// set the payment type to the default one for Monthly/Annual.
	switch (type) {
		case EPurchaseType.Annual:
			newState.payment.model.paymentType = AnnualFrequencyPaymentTypes[0];
			break;
		case EPurchaseType.Monthly:
			newState.payment.model.paymentType = MonthlyFrequencyPaymentTypes[0];
			break;
	}

	newState.payment = ValidatePayment(newState.payment.model);

	return newState;
}
