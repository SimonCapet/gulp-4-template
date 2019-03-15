import { Action } from '@ngrx/store';
import { ISession } from 'ukbc/models';

export const SET_SESSION_EXPIRY = '[Session] Set session expiry';

export class SetSessionExpiryAction implements Action {
	readonly type = SET_SESSION_EXPIRY;
	constructor(public payload: Date) {}
}

export type Actions = SetSessionExpiryAction;
