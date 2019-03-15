import { Action } from '@ngrx/store';
import { ICover } from 'ukbc/models';
import { ESaveCoverSource, EPaymentCardType } from 'ukbc/enums';

export const SET_COVER_START_DATE = '[Cover] Set cover start date';
export const SAVE_COVER = '[Cover] Save cover';
export const SET_COVER_SAVING = '[Cover] Set cover saving';

export class SetCoverStartDateAction implements Action {
	readonly type = SET_COVER_START_DATE;
	constructor(public payload: Date) {}
}

export class SaveCoverAction implements Action {
	readonly type = SAVE_COVER;
	constructor(public payload?: { source: ESaveCoverSource; openCard?: EPaymentCardType }) {}
}

export class SetCoverSavingAction implements Action {
	readonly type = SET_COVER_SAVING;
	constructor(public payload: boolean) {}
}

export type Actions = SetCoverStartDateAction | SaveCoverAction | SetCoverSavingAction;
