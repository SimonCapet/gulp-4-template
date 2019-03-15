import { getSessionStorageReducerState } from 'shared/helpers';
import { IEagleEyeState } from 'ukbc/models';
import * as eagleEyeActions from 'ukbc/actions/eagle-eye.actions';
import { IValidated } from 'shared/models';
import { validate } from 'shared/services';
import { eagleEyeTokenValidator } from 'ukbc/validation-rules';
import { IEagleEyeToken } from 'ukbc/models/eagle-eye.model';

export type State = IEagleEyeState;

const validateToken = (token: string): IValidated<IEagleEyeToken> => validate(eagleEyeTokenValidator, { value: token });

const savedState: IEagleEyeState = getSessionStorageReducerState('eagleEye');

const initialState: IEagleEyeState = savedState || {
	token: validateToken(''),
	isTokenVerified: false,
	isVerificationLoading: false,
	tokenValue: 0,
};

export function reducer(state: IEagleEyeState = initialState, action: eagleEyeActions.Actions): IEagleEyeState {
	switch (action.type) {
		case eagleEyeActions.SET_EAGLE_EYE_TOKEN:
			return { ...state, token: validateToken(action.payload) };
		case eagleEyeActions.START_VERIFY_EAGLE_EYE_TOKEN:
			return { ...state, isVerificationLoading: true };
		case eagleEyeActions.VERIFY_EAGLE_EYE_TOKEN:
			return { ...state, isTokenVerified: action.payload.isValid, isVerificationLoading: false, tokenValue: action.payload.value };
		default:
			return state;
	}
}

export const getEagleEyeTokenValue = (state: IEagleEyeState) => state.tokenValue;
