import { Action } from '@ngrx/store';
import { EYesNoType } from 'ukbc/enums';

export const SET_EMAIL_CONSENT = '[Consent] Set email preference';
export const SET_DOCUMENTS_CONSENT = '[Consent] Set documents preference';

export class SetEmailConsent implements Action {
	readonly type = SET_EMAIL_CONSENT;
	constructor(public payload: EYesNoType) {}
}
export class SetDocumentsConsent implements Action {
	readonly type = SET_DOCUMENTS_CONSENT;
	constructor(public payload: EYesNoType) {}
}

export type Actions = SetEmailConsent | SetDocumentsConsent;
