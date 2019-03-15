import { Action } from '@ngrx/store';
import { IPricesResponse } from 'ukbc/models';
import { EPurchaseType, EPolicyDuration } from 'ukbc/enums';

export const GET_PRICES = '[Pricing] Get prices';
export const SET_PRICES = '[Pricing] Set prices';
export const GET_TOTAL = '[Pricing] Get total';
export const BEGIN_SET_FREQUENCY = '[Pricing] Begin set frequency';
export const CONFIRM_SET_FREQUENCY = '[Pricing] Confirm set frequency';
export const RESET_PRICING = '[Pricing] Reset pricing';
export const SET_POLICY_DURATION = '[Pricing] Set Policy Duration';

export class GetPricesAction implements Action {
	readonly type = GET_PRICES;
}

export class SetPricesAction implements Action {
	readonly type = SET_PRICES;
	constructor(public payload: IPricesResponse) {}
}

export class GetTotalAction implements Action {
	readonly type = GET_TOTAL;
}

export class BeginSetFrequencyAction implements Action {
	readonly type = BEGIN_SET_FREQUENCY;
	constructor(public payload: EPurchaseType) {}
}

export class ConfirmSetFrequencyAction implements Action {
	readonly type = CONFIRM_SET_FREQUENCY;
	constructor(public payload: EPurchaseType) {}
}

export class ResetPricingAction implements Action {
	readonly type = RESET_PRICING;
}

export class SetPolicyDurationAction implements Action {
	readonly type = SET_POLICY_DURATION;
	constructor(public payload: EPolicyDuration) {}
}

export type Actions =
	| GetPricesAction
	| SetPricesAction
	| GetTotalAction
	| BeginSetFrequencyAction
	| ConfirmSetFrequencyAction
	| ResetPricingAction
	| SetPolicyDurationAction;
