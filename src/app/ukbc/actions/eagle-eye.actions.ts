import { Action } from '@ngrx/store';
import { IEagleEyeVerificationResponse } from 'ukbc/models/eagle-eye.model';

export const SET_EAGLE_EYE_TOKEN = '[Eagle Eye] Set token';
export const START_VERIFY_EAGLE_EYE_TOKEN = '[Eagle Eye] Start verify token';
export const VERIFY_EAGLE_EYE_TOKEN = '[Eagle Eye] Verify token';

export class SetEagleEyeTokenAction implements Action {
	readonly type = SET_EAGLE_EYE_TOKEN;
	constructor(public payload: string) {}
}

export class StartVerifyEagleEyeTokenAction implements Action {
	readonly type = START_VERIFY_EAGLE_EYE_TOKEN;
}

export class VerifyEagleEyeTokenAction implements Action {
	readonly type = VERIFY_EAGLE_EYE_TOKEN;
	constructor(public payload: { isValid: boolean; value: number }) {}
}

export type Actions = SetEagleEyeTokenAction | StartVerifyEagleEyeTokenAction | VerifyEagleEyeTokenAction;
