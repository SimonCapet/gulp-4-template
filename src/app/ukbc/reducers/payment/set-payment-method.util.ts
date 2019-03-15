import { EPurchaseType } from 'ukbc/enums';
import { IInitialState, IGeneralContent, IJourneyContent } from 'ukbc/models';

const { AAFAnnualDoc, AAFMonthlyDoc } = <IGeneralContent>(<IInitialState>(<any>window).UKBC_initialState).ContentInformation.GeneralInfo;

const { AnnualFrequencyPaymentTypes, MonthlyFrequencyPaymentTypes } = <IJourneyContent>(<IInitialState>(<any>window).UKBC_initialState)
	.ContentInformation.Journey;

export function SetPaymentMethod(stateCopy, method) {
	if (method) {
		stateCopy.paymentType = method.paymentType;
		stateCopy.directDebitPaymentType = method.directDebitPaymentType;
	} else {
		stateCopy.paymentType =
			stateCopy.purchaseType === EPurchaseType.Monthly ? MonthlyFrequencyPaymentTypes[0] : AnnualFrequencyPaymentTypes[0];
	}

	stateCopy.aafAnnualDoc = AAFAnnualDoc;
	stateCopy.aafMonthlyDoc = AAFMonthlyDoc;

	return stateCopy;
}
