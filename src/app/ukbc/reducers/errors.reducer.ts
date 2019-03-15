import * as errors from 'ukbc/actions/error.actions';
import { IErrorState, IError } from 'ukbc/models';

export type State = IErrorState;

const initialState: State = {
	error: {
		errorCode: '',
		action: null,
	},
};

function showError(state: State, error: IError) {
	let newError: IError;
	newError = { errorCode: error.errorCode, action: error.action || null, reload: error.reload, retryCallback: error.retryCallback || null };

	return newError;
}

function removeError(state: State, error: IError) {
	const newError = { errorCode: '', action: null };

	return newError;
}

export function reducer(state = initialState, action): State {
	switch (action.type) {
		case errors.SHOW_ERROR:
			return { ...state, error: showError(state, action.payload) };
		case errors.REMOVE_ERROR:
			return initialState;
		default:
			return state;
	}
}

export const getError = (state: State) => state.error;
