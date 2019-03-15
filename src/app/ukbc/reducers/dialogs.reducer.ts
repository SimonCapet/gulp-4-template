import * as dialogActions from 'ukbc/actions/dialog.actions';
import { IDialog } from 'ukbc/models';

export interface State {
	dialogs: IDialog[];
}

const initialState: State = {
	dialogs: [],
};

export function reducer(state = initialState, action): State {
	switch (action.type) {
		case dialogActions.CREATE_DIALOG:
			return { ...state, dialogs: addOrUpdateDialog(state.dialogs, action.payload) };
		case dialogActions.OPEN_DIALOG:
			return { ...state, dialogs: setDialogVisibility(state.dialogs, action.payload.id, true, action.payload.hideCloseButton) };
		case dialogActions.CLOSE_DIALOG:
			return { ...state, dialogs: setDialogVisibility(state.dialogs, action.payload, false) };
		default:
			return state;
	}
}

function addOrUpdateDialog(dialogs: IDialog[], newDialog: IDialog): IDialog[] {
	return [...dialogs.filter(m => m.id !== newDialog.id), newDialog];
}

function setDialogVisibility(dialogs: IDialog[], id: string, open: boolean, hideCloseButton = false): IDialog[] {
	const dialogIndex = dialogs.findIndex(m => m.id === id);

	dialogs[dialogIndex].open = open;
	dialogs[dialogIndex].hideCloseButton = hideCloseButton;

	return [...dialogs];
}

export const getDialogs = (state: State) => state.dialogs;
export const getIsDialogOpen = (state: State) => !!state.dialogs.find(dialog => dialog.open);
