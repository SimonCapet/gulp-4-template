import { Action } from '@ngrx/store';
import { IDialog } from 'ukbc/models';

export const CREATE_DIALOG = '[Dialogs] Create Dialog';
export const OPEN_DIALOG = '[Dialogs] Open Dialog';
export const CLOSE_DIALOG = '[Dialogs] Close Dialog';

export class CreateDialogAction implements Action {
	readonly type = CREATE_DIALOG;
	constructor(public payload: IDialog) {}
}

export class OpenDialogAction implements Action {
	readonly type = OPEN_DIALOG;
	constructor(public payload: { id: string; hideCloseButton?: boolean }) {}
}

export class CloseDialogAction implements Action {
	readonly type = CLOSE_DIALOG;
	constructor(public payload: string) {}
}
