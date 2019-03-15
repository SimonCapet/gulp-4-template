import * as layout from 'ukbc/actions/layout.actions';
import { IJourneyContent, IStepConfig } from 'ukbc/models';
import { EStepType } from 'ukbc/enums';
import { getSessionStorageReducerState } from 'shared/helpers';

const Steps = <IStepConfig[]>(<any>window).UKBC_initialState.ContentInformation.Journey.Steps;
const Journey = <IJourneyContent>(<any>window).UKBC_initialState.ContentInformation.Journey;
export interface State {
	basketOpen: boolean;
	basketHidden: boolean;
	basketHideBasisItem: boolean;
	scrollOffset: number;
	questionProgressHidden: boolean;
}
const hasQuestionsStep = !!Steps.find(s => s.Type === EStepType.Questions);
const hideBasisItemFromBasket = !!(hasQuestionsStep || Journey.HideBasisItemInBasket);
const initialState: State = getSessionStorageReducerState('layout', true) || {
	basketOpen: false,
	basketHidden: hasQuestionsStep,
	basketHideBasisItem: hideBasisItemFromBasket,
	scrollOffset: 0,
	questionProgressHidden: true,
};

export function reducer(state = initialState, action: layout.Actions): State {
	switch (action.type) {
		case layout.TOGGLE_BASKET_OPEN: {
			return <State>{ ...state, basketOpen: !state.basketOpen };
		}
		case layout.SHOW_BASKET: {
			return <State>{ ...state, basketHidden: false };
		}
		case layout.SET_SCROLL_OFFSET: {
			return <State>{ ...state, scrollOffset: action.offset };
		}
		case layout.SHOW_BASKET_BASIS_ITEM: {
			return <State>{ ...state, basketHideBasisItem: false };
		}
		case layout.SHOW_QUESTIONS_PROGRESS: {
			return <State>{ ...state, questionProgressHidden: false };
		}
		default:
			return state;
	}
}

export const getBasketOpen = (state: State) => state.basketOpen;
export const getBasketHidden = (state: State) => state.basketHidden;
export const getBasketBasisItemHidden = (state: State) => state.basketHideBasisItem;
export const getScrollOffset = (state: State) => state.scrollOffset;
export const getQuestionsProgressHidden = (state: State) => state.questionProgressHidden;
