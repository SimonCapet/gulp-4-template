import { Action } from '@ngrx/store';
import { EDetailsCardType, EPaymentCardType, EProductSelectionSource } from 'ukbc/enums';

export const BEGIN_SELECT_PRODUCT = '[Products] Begin select product';
export const CONFIRM_SELECT_PRODUCT = '[Products] Confirm select product';
export const BEGIN_DESELECT_PRODUCT = '[Products] Begin deselect product';
export const CONFIRM_DESELECT_PRODUCT = '[Products] Confirm deselect product';

export class BeginSelectProductAction implements Action {
	readonly type = BEGIN_SELECT_PRODUCT;
	constructor(public payload: { productCodes: Array<string>; source: EProductSelectionSource; questionId?: string }) {}
}

export class ConfirmSelectProductAction implements Action {
	readonly type = CONFIRM_SELECT_PRODUCT;
	constructor(public payload: { productCodes: Array<string>; source: EProductSelectionSource; preventSettingContacts?: boolean, cardToComplete?: EDetailsCardType | EPaymentCardType  }) {}
}

export class BeginDeselectProductAction implements Action {
	readonly type = BEGIN_DESELECT_PRODUCT;
	constructor(public payload: { productCodes: Array<string>; source: EProductSelectionSource; questionId?: string }) {}
}

export class ConfirmDeselectProductAction implements Action {
	readonly type = CONFIRM_DESELECT_PRODUCT;
	constructor(public payload: { productCodes: Array<string>; source: EProductSelectionSource }) {}
}

export type Actions = BeginSelectProductAction | ConfirmSelectProductAction | BeginDeselectProductAction | ConfirmDeselectProductAction;
