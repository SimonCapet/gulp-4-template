import * as loadingActions from 'ukbc/actions/loading.actions';

export interface ILoadingState {
	showLoadingIndicator: boolean;
	loadingIndicatorTitle: string;
}

const initialState: ILoadingState = {
	showLoadingIndicator: false,
	loadingIndicatorTitle: '',
};

export function reducer(state: ILoadingState = initialState, action: loadingActions.Actions): ILoadingState {
	switch (action.type) {
		case loadingActions.SHOW_LOADING_INDICATOR:
			return { showLoadingIndicator: true, loadingIndicatorTitle: action.payload.title };
		case loadingActions.HIDE_LOADING_INDICATOR:
			return { ...state, showLoadingIndicator: false };
		default:
			return state;
	}
}
