import * as coverActions from 'ukbc/actions/cover.actions';
import { ICover, IInitialState } from 'ukbc/models';
import { IValidated } from 'shared/models';
import { validate } from 'shared/services/validator';
import { coverValidator } from 'ukbc/validation-rules';

import { getSessionStorageReducerState } from 'shared/helpers';

export type State = IValidated<ICover>;

const content: IInitialState = (<any>window).UKBC_initialState;

const validateCover = (cover: ICover): IValidated<ICover> => validate(coverValidator, cover);

const savedState: State = getSessionStorageReducerState('cover', true);

const initialState: State = savedState
	? { ...savedState, model: { ...savedState.model, SavingCover: false } }
	: validateCover({
			StartDate: content.PreSelectedCoverStartDate ? new Date(content.PreSelectedCoverStartDate) : new Date(),
			SavingCover: false,
		});

export function reducer(state: State = initialState, action: coverActions.Actions): State {
	switch (action.type) {
		case coverActions.SET_COVER_START_DATE:
			return validateCover({ ...state.model, StartDate: action.payload });
		case coverActions.SAVE_COVER:
			return validateCover({ ...state.model, SavingCover: true });
		case coverActions.SET_COVER_SAVING:
			return validateCover({ ...state.model, SavingCover: action.payload });
		default:
			return state;
	}
}

export const getCover = (state: State) => state;

export const getCoverStartDate = (state: State) => state.model.StartDate;
