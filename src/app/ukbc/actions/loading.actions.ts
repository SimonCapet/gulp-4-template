import { Action } from '@ngrx/store';

export const SHOW_LOADING_INDICATOR = '[Loading] Show loading indicator';
export const HIDE_LOADING_INDICATOR = '[Loading] Hide loading indicator';

export class ShowLoadingIndicator implements Action {
	readonly type = SHOW_LOADING_INDICATOR;
	constructor(public payload: { title: string }) {}
}

export class HideLoadingIndicator implements Action {
	readonly type = HIDE_LOADING_INDICATOR;
	constructor() {}
}

export type Actions = ShowLoadingIndicator | HideLoadingIndicator;
