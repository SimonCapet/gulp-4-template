import { IInitialState, IGeneralContent, IPaymentState } from 'ukbc/models';

import * as paymentActions from 'ukbc/actions/payment.actions';

import { ValidatePayment } from 'ukbc/reducers/payment/validate-payment.util';
import { ValidateDirectDebitAgreeToTerms } from 'ukbc/reducers/payment/validate-direct-debit-agreement.util';
import { SetDirectDebitField } from 'ukbc/reducers/payment/set-direct-debit-field.util';
import { SetPaymentMethod } from 'ukbc/reducers/payment/set-payment-method.util';
import { SetPurchaseType } from 'ukbc/reducers/payment/set-purchase-type.util';
import { UpdateRealex } from 'ukbc/reducers/payment/update-realex.util';
import { GenerateInitialState } from 'ukbc/reducers/payment/generate-initial-state.util';
import { SetPolicyDuration } from 'ukbc/reducers/payment/set-policy-duration.util';

export type State = IPaymentState;

const initialState: State = GenerateInitialState();

export function reducer(state: State = initialState, action: paymentActions.Actions): State {
	// TODO: Update date direct debit taken, account name, account number, sort code
	switch (action.type) {
		case paymentActions.SET_PAYMENT_METHOD:
			return { ...state, payment: { ...ValidatePayment(SetPaymentMethod({ ...state.payment.model }, action.payload)) } };
		case paymentActions.SET_DIRECT_DEBIT_PAYMENT_METHOD:
			return {
				...state,
				payment: { ...ValidatePayment(SetPaymentMethod({ ...state.payment.model }, action.payload)) },
				iframeLoading: true,
			};
		case paymentActions.SET_PURCHASE_TYPE:
			return SetPurchaseType(state, action.payload);
		case paymentActions.SET_POLICY_DURATION:
			return SetPolicyDuration(state, action.payload);
		case paymentActions.SET_DIRECT_DEBIT_PAYMENT_FIELD:
			return { ...state, payment: { ...ValidatePayment(SetDirectDebitField({ ...state.payment.model }, action.payload)) } };
		case paymentActions.UPDATE_REALEX_MODEL:
			return { ...state, options: UpdateRealex({ ...state.options }, action.payload) };
		case paymentActions.GET_PAYMENT_OPTIONS:
			return { ...state, optionsLoading: true, iframeLoading: true };
		case paymentActions.SET_PAYMENT_OPTIONS:
			return { ...state, options: action.payload, optionsLoading: false };
		case paymentActions.RESET_PAYMENT_OPTIONS:
			return {
				...state,
				options: null,
				optionsLoading: false,
				iframeLoading: true,
				aafAnnualDoc: null,
				aafMonthlyDoc: null,
			};
		case paymentActions.SHOW_REALEX_RETRY:
			return { ...state, retry: { show: true, message: action.payload } };
		case paymentActions.HIDE_REALEX_RETRY:
			return { ...state, retry: { show: false, message: '' } };
		case paymentActions.SET_AGREE_TO_DIRECT_DEBIT_TERMS:
			return { ...state, agreeToDirectDebitTermsAndConditions: ValidateDirectDebitAgreeToTerms(action.payload) };
		case paymentActions.SET_PAYMENT_OPTIONS_AND_REALEX_MODEL:
			return { ...state, options: action.payload };
		case paymentActions.RESET_REALEX_MODEL:
			const options = { ...state.options, iframeLoading: true };
			delete options['RealexModel'];
			return { ...state, options };
		case paymentActions.SET_IFRAME_LOADING:
			return {
				...state,
				iframeLoading: action.payload,
			};
		case paymentActions.SET_COLLECTION_DATE:
			return { ...state, payment: { ...ValidatePayment({ ...state.payment.model, collectionDate: action.payload }) } };
		case paymentActions.PREVENT_FREQUENCY_CHANGE:
			return <State>{ ...state, canChangeFrequency: false };
		case paymentActions.ENABLE_FREQUENCY_CHANGE:
			return <State>{ ...state, canChangeFrequency: true };
		default:
			return state;
	}
}

export const getPayment = (state: State) => state.payment;
export const getPaymentOptions = (state: State) => state.options;
export const getPaymentState = (state: State) => state;
export const getRetry = (state: State) => state.retry;
export const getRealexModel = (state: State) => (state.options ? state.options.RealexModel : null);
export const getIframeLoading = (state: State) => state.iframeLoading;
export const getCollectionDate = (state: State) => state.payment.model.collectionDate;
export const getPaymentValidationErrors = (state: State) => state.payment.validationErrors;
export const getCanChangePaymentFrequency = (state: State) => state.canChangeFrequency;
