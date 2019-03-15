import * as sessionActions from 'ukbc/actions/session.actions';
import { ISession } from 'ukbc/models';

import { getSessionStorageReducerState } from 'shared/helpers';

export type State = ISession;

const savedState: State = getSessionStorageReducerState('session');

const initialState: State = savedState || { expiries: null };

export function reducer(state: State = initialState, action: sessionActions.Actions): State {
	switch (action.type) {
		case sessionActions.SET_SESSION_EXPIRY:
			return { ...state, expiries: action.payload };
		default:
			return state;
	}
}

export const getSession = (state: State) => state;
export const getSessionExpiry = (state: State) => state.expiries;
