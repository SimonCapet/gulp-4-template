import { IPaymentState, IInitialState, IGeneralContent, IJourneyContent } from 'ukbc/models';
import { EPurchaseType, EPolicyDuration } from 'ukbc/enums';
import { ValidatePayment } from 'ukbc/reducers/payment/validate-payment.util';

const { AnnualFrequencyPaymentTypes, MonthlyFrequencyPaymentTypes } = <IJourneyContent>(<IInitialState>(<any>window).UKBC_initialState)
	.ContentInformation.Journey;

export function SetPolicyDuration(state: IPaymentState, type: EPolicyDuration): IPaymentState {
	const newState = { ...state };
	newState.payment.model.policyDuration = type;
	return newState;
}
