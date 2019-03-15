import { Action } from '@ngrx/store';
import { IPayment, IPaymentOptions, ISaveCoverResponse, IRealexModel, ISetPaymentMethodModel, IRealexTimingsModel } from 'ukbc/models';
import { EPaymentType, EPurchaseType, EPolicyDuration } from 'ukbc/enums';

export const SET_PAYMENT_METHOD = '[Payment] Set payment method';
export const SET_DIRECT_DEBIT_PAYMENT_METHOD = '[Payment] Set direct debit payment method';
export const SET_PURCHASE_TYPE = '[Payment] Set purchase type';
export const SET_POLICY_DURATION = '[Payment] Set policy duration';
export const GET_PAYMENT_OPTIONS = '[Payment] Get payment options';
export const SET_PAYMENT_OPTIONS = '[Payment] Set payment options';
export const RESET_PAYMENT_OPTIONS = '[Payment] Reset payment options';
export const UPDATE_REALEX_MODEL = '[Payment] Update Realex model';
export const SHOW_REALEX_RETRY = '[Payment] Show Realex retry';
export const HIDE_REALEX_RETRY = '[Payment] Hide Realex retry';
export const SET_DIRECT_DEBIT_PAYMENT_FIELD = '[Payment] Set direct debit field';
export const SET_AGREE_TO_DIRECT_DEBIT_TERMS = '[Payment] Set agree to Direct Debit terms';
export const SET_PAYMENT_OPTIONS_AND_REALEX_MODEL = '[Payment] Set payment options and realex model';
export const RESET_REALEX_MODEL = '[Payment] Reset realex action';
export const SET_IFRAME_LOADING = '[Payment] Set iframe loading';
export const SAVE_IFRAME_LOADING_TIME = '[Payment] Save iframe loading time';
export const SET_COLLECTION_DATE = '[Payment] Set collection date';
export const PREVENT_FREQUENCY_CHANGE = '[Payment] Prevent frequency change';
export const ENABLE_FREQUENCY_CHANGE = '[Payment] Enable frequency change';

export class SetPaymentMethodAction implements Action {
	readonly type = SET_PAYMENT_METHOD;
	constructor(public payload?: ISetPaymentMethodModel) {}
}

export class SetDirectDebitPaymentMethodAction implements Action {
	readonly type = SET_DIRECT_DEBIT_PAYMENT_METHOD;
	constructor(public payload: ISetPaymentMethodModel) {}
}

export class SetPurchaseTypeAction implements Action {
	readonly type = SET_PURCHASE_TYPE;
	constructor(public payload: EPurchaseType) {}
}

export class SetPolicyDurationAction implements Action {
	readonly type = SET_POLICY_DURATION;
	constructor(public payload: EPolicyDuration) {}
}

export class GetPaymentOptionsAction implements Action {
	readonly type = GET_PAYMENT_OPTIONS;
}

export class SetPaymentOptionsAction implements Action {
	readonly type = SET_PAYMENT_OPTIONS;
	constructor(public payload: IPaymentOptions) {}
}

export class ResetPaymentOptionsAction implements Action {
	readonly type = RESET_PAYMENT_OPTIONS;
}

export class UpdateRealexModel implements Action {
	readonly type = UPDATE_REALEX_MODEL;
	constructor(public payload: IRealexModel) {}
}

export class ShowRealexRetry implements Action {
	readonly type = SHOW_REALEX_RETRY;
	constructor(public payload: string) {}
}

export class HideRealexRetry implements Action {
	readonly type = HIDE_REALEX_RETRY;
}

export class SetDirectDebitPaymentField implements Action {
	readonly type = SET_DIRECT_DEBIT_PAYMENT_FIELD;
	constructor(public payload: object) {}
}

export class SetDirectDebitAgreeToTerms implements Action {
	readonly type = SET_AGREE_TO_DIRECT_DEBIT_TERMS;
	constructor(public payload: boolean) {}
}

export class SetPaymentOptionsAndRealexModel implements Action {
	readonly type = SET_PAYMENT_OPTIONS_AND_REALEX_MODEL;
	constructor(public payload: ISaveCoverResponse) {}
}

export class ResetRealexModel implements Action {
	readonly type = RESET_REALEX_MODEL;
}

export class SetIframeLoading implements Action {
	readonly type = SET_IFRAME_LOADING;
	constructor(public payload: boolean) {}
}

export class SaveIframeLoadingTime implements Action {
	readonly type = SAVE_IFRAME_LOADING_TIME;
	constructor(public payload: IRealexTimingsModel) {}
}

export class SetCollectionDate implements Action {
	readonly type = SET_COLLECTION_DATE;
	constructor(public payload: string) {}
}

export class PreventFrequencyChangeAction implements Action {
	readonly type = PREVENT_FREQUENCY_CHANGE;
}

export class EnableFrequencyChangeAction implements Action {
	readonly type = ENABLE_FREQUENCY_CHANGE;
}

export type Actions =
	| SetPaymentMethodAction
	| SetDirectDebitPaymentMethodAction
	| SetPurchaseTypeAction
	| SetPolicyDurationAction
	| GetPaymentOptionsAction
	| SetPaymentOptionsAction
	| ResetPaymentOptionsAction
	| UpdateRealexModel
	| ShowRealexRetry
	| HideRealexRetry
	| SetDirectDebitPaymentField
	| SetDirectDebitAgreeToTerms
	| SetPaymentOptionsAndRealexModel
	| ResetRealexModel
	| SetIframeLoading
	| SaveIframeLoadingTime
	| SetCollectionDate
	| PreventFrequencyChangeAction
	| EnableFrequencyChangeAction;
