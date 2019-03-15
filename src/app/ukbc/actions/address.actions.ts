import { Action } from '@ngrx/store';
import { IAddressFieldEventPayload, IAddress } from 'shared/models';

export const SET_ADDRESS_FIELD = '[Address] Set field';
export const SET_ADDRESS = '[Address] Set address';
export const SET_MANUALLY_EDIT_ADDRESS = '[Address] Set manually edit address';
export const SET_ADDRESS_CHOSEN = '[Address] Set address found';

export class SetAddressField implements Action {
	readonly type = SET_ADDRESS_FIELD;
	constructor(public payload: IAddressFieldEventPayload) {}
}

export class SetAddress implements Action {
	readonly type = SET_ADDRESS;
	constructor(public payload: IAddress) {}
}

export class SetManuallyEditAddress implements Action {
	readonly type = SET_MANUALLY_EDIT_ADDRESS;
	constructor(public payload: boolean) {}
}

export class SetAddressChosen implements Action {
	readonly type = SET_ADDRESS_CHOSEN;
	constructor(public payload: boolean) {}
}

export type Actions = SetAddressField | SetAddress | SetManuallyEditAddress | SetAddressChosen;
