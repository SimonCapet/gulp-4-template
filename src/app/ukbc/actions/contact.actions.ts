import { Action } from '@ngrx/store';
import { IContactFields } from 'ukbc/models';

export const EDIT_CONTACT = '[Contacts] Edit contact';
export const COMPLETE_CONTACT = '[Contacts] Complete contact';
export const SET_CONTACTS = '[Contacts] Set contacts';
export const SET_CONTACT_FIELD = '[Contacts] Set field';

export class EditContact implements Action {
	readonly type = EDIT_CONTACT;
	constructor(public payload: any) {}
}

export class CompleteContact implements Action {
	readonly type = COMPLETE_CONTACT;
	constructor(public payload: any) {}
}

export class SetContacts implements Action {
	readonly type = SET_CONTACTS;
	constructor(public payload: number) {}
}

export class SetContactField implements Action {
	readonly type = SET_CONTACT_FIELD;
	constructor(public payload: IContactFields) {}
}

export type Actions = EditContact | CompleteContact | SetContacts | SetContactField;
