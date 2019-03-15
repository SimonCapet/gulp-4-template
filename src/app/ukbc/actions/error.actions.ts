import { Action } from '@ngrx/store';
import { IError } from 'ukbc/models';

export const SHOW_ERROR = '[Error] Show Error';
export const REMOVE_ERROR = '[Error] Remove Error';

export class ShowErrorAction implements Action {
	readonly type = SHOW_ERROR;
	constructor(public payload: IError) {}
}

export class RemoveErrorAction implements Action {
	readonly type = REMOVE_ERROR;
	constructor() {}
}
