import { State } from 'ukbc/reducers/payment/payment.reducer';
import { getSessionStorageReducerState } from 'shared/helpers';
import { ValidatePayment } from 'ukbc/reducers/payment/validate-payment.util';
import { useMonthlyAsDefault } from 'ukbc/helpers';
import { ValidateDirectDebitAgreeToTerms } from 'ukbc/reducers/payment/validate-direct-debit-agreement.util';
import { IInitialState, IGeneralContent, IJourneyContent } from 'ukbc/models';
import { EPurchaseType } from 'ukbc/enums';

const { DefaultPaymentType, DefaultMonthlyPaymentType, DefaultDirectDebitPaymentType } = <IGeneralContent>(<IInitialState>(<any>window)
	.UKBC_initialState).ContentInformation.GeneralInfo;

const { AnnualFrequencyPaymentTypes, MonthlyFrequencyPaymentTypes, TwoYearPolicyDefault } = <IJourneyContent>(<IInitialState>(<any>window)
	.UKBC_initialState).ContentInformation.Journey;

const savedState: State = getSessionStorageReducerState('payment');

export function GenerateInitialState() {
	return {
		payment: savedState
			? savedState.payment
			: {
					...ValidatePayment({
						paymentType: useMonthlyAsDefault() ? DefaultMonthlyPaymentType : DefaultPaymentType,
						directDebitPaymentType: DefaultDirectDebitPaymentType,
						purchaseType: useMonthlyAsDefault() ? EPurchaseType.Monthly : EPurchaseType.Annual,
						policyDuration: TwoYearPolicyDefault,
						accountName: null,
						accountNumber: null,
						sortCode: null,
						collectionDate: null,
					}),
				},
		options: null,
		retry: {
			show: false,
			message: '',
		},
		optionsLoading: false,
		agreeToDirectDebitTermsAndConditions: ValidateDirectDebitAgreeToTerms(false),
		iframeLoading: false,
		aafAnnualDoc: null,
		aafMonthlyDoc: null,
		availablePaymentTypes: savedState
			? savedState.availablePaymentTypes
			: useMonthlyAsDefault() ? MonthlyFrequencyPaymentTypes : AnnualFrequencyPaymentTypes,
		canChangeFrequency: true,
	};
}
