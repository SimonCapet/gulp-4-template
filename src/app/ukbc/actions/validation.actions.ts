import { Action } from '@ngrx/store';

export const SET_SHOW_VALIDATION_ERRORS = '[Validation] Set show validation errors';

export class SetShowValidationErrors implements Action {
	readonly type = SET_SHOW_VALIDATION_ERRORS;
	constructor(public payload: boolean) {}
}

export type Actions = SetShowValidationErrors;
