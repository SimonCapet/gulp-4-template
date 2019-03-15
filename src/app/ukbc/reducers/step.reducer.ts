import * as stepActions from 'ukbc/actions/step.actions';
import { IInitialState, IStep, IStepConfig } from 'ukbc/models';

import { getSessionStorageReducerState } from 'shared/helpers';
import { IsDowngrade } from 'ukbc/helpers';

const Steps = <IStepConfig[]>(<IInitialState>(<any>window).UKBC_initialState).ContentInformation.Journey.Steps;

export type State = IStep[];

export const SavedStepState: State = getSessionStorageReducerState('step', true);

const mappedSteps = Steps.map(step => ({
	type: step.Type,
	url: step.Url,
	data: {
		Title: step.Title,
		Subtitle: step.Subtitle,
		products: step.Products,
		ShowLiveChat: step.ShowLiveChat,
		AnalyticsPageId: step.AnalyticsPageId,
		ProgressBarLabel: step.ProgressBarLabel,
		BasketSwitches: step.BasketSwitches,
		BasketHistoricalItems: step.BasketHistoricalItems,
		CompleteStepButton: step.CompleteStepButton,
		ShowLoadingIndicator: step.ShowLoadingIndicator,
		LoadingIndicatorTitle: step.LoadingIndicatorTitle,
		LoadingIndicatorDurationMilliseconds: step.LoadingIndicatorDurationMilliseconds,
		ShowTermsAndConditions: step.ShowTermsAndConditions,
	},
	status: {
		completed: false,
		current: false,
	},
}));

const initialState: State = !IsDowngrade() && SavedStepState ? SavedStepState : mappedSteps;

export function reducer(state: State = initialState, action: stepActions.Actions): State {
	switch (action.type) {
		case stepActions.SET_CURRENT_STEP_COMPLETED:
			return state.map((step): IStep => {
				if (step.status.current) {
					return {
						...step,
						status: { ...step.status, completed: true },
					};
				}
				return step;
			});

		case stepActions.SET_STEP_CURRENT:
			const newStepIndex = state.findIndex(s => `/${s.url}` === action.stepUrl.split('?')[0]);
			return state.map((step, index): IStep => {
				if (index === newStepIndex) {
					return {
						...step,
						status: { completed: false, current: true },
					};
				} else {
					return {
						...step,
						status: {
							completed: index < newStepIndex ? step.status.completed : false,
							current: false,
						},
					};
				}
			});
		default:
			return state;
	}
}

export const getSteps = (state: State) => state;
export const getCurrentStep = (state: State): IStep => state.find(step => step.status.current);
export const getCurrentStepIndex = (state: State) => state.findIndex(s => s.status.current);
export const getNextStep = (state: State): IStep | null => state[getCurrentStepIndex(state) + 1];
export const getPreviousStep = (state: State): IStep | null => state[getCurrentStepIndex(state) - 1];
export const getCompletedSteps = (state: State) => state.filter(step => step.status.completed).map(step => step.url);
export const getShowLiveChat = (state: State): boolean => {
	const currentStep = getCurrentStep(state);

	return (currentStep && currentStep.data.ShowLiveChat) || false;
};
