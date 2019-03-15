import { Actions, SET_SHOW_VALIDATION_ERRORS } from 'ukbc/actions/validation.actions';

export interface State {
	forceShowValidationErrors: boolean;
}

const initialState: State = { forceShowValidationErrors: false };

export function reducer(state: State = initialState, action: Actions): State {
	switch (action.type) {
		case SET_SHOW_VALIDATION_ERRORS:
			return { forceShowValidationErrors: action.payload };
		default:
			return state;
	}
}

export const getForceShowValidationErrors = (state: State) => state.forceShowValidationErrors;
