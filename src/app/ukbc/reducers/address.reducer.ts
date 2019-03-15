import { getSessionStorageReducerState } from 'shared/helpers';

import { IAddress } from 'shared/models';
import * as addressActions from 'ukbc/actions/address.actions';
import { IValidated } from 'shared/models/validation.model';
import { validate } from 'shared/services/validator';
import { addressValidator } from 'ukbc/validation-rules';
import { IAddressState } from 'shared/models/address.model';

const content = (<any>window).UKBC_initialState;
export const preSelectedAddress = content.PreSelectedAddress;

export type State = IAddressState;

const validateAddress = (address: IAddress): IValidated<IAddress> => validate(addressValidator, address);

const savedState: State = getSessionStorageReducerState('address', true);

let initialState: State;

if (savedState) {
	initialState = savedState;
} else if (preSelectedAddress) {
	initialState = {
		...validateAddress({ Id: require('uuid/v4')(), ...preSelectedAddress }),
		manuallyEditingAddress: true,
		hasChosenAddress: true,
	};
} else {
	initialState = {
		...validateAddress({
			Id: require('uuid/v4')(),
			AddressLine1: '',
			AddressLine2: '',
			AddressLine3: '',
			Town: '',
			County: '',
			Postcode: '',
		}),
		manuallyEditingAddress: false,
		hasChosenAddress: false,
	};
}

export function reducer(state: State = initialState, action: addressActions.Actions): State {
	switch (action.type) {
		case addressActions.SET_ADDRESS_FIELD:
			return {
				...state,
				...validateAddress({
					...state.model,
					[action.payload.field]: action.payload.value.trim(),
				}),
			};
		case addressActions.SET_ADDRESS:
			return { ...state, ...validateAddress({ Id: state.model.Id, ...action.payload }) };
		case addressActions.SET_MANUALLY_EDIT_ADDRESS:
			return { ...state, manuallyEditingAddress: action.payload, hasChosenAddress: false };
		case addressActions.SET_ADDRESS_CHOSEN:
			return { ...state, hasChosenAddress: action.payload };
		default:
			return state;
	}
}

export const getAddress = (state: State) => state;
