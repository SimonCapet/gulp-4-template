import { EStepType } from 'ukbc/enums';
import { IQuestion } from 'ukbc/models/questions.model';

export interface IStep {
	type: EStepType;
	url: string;
	data: {
		Title: string;
		Subtitle: string;
		products?: string[];
		ShowLiveChat: boolean;
		AnalyticsPageId: string;
		ProgressBarLabel: string;
		BasketSwitches: boolean;
		BasketHistoricalItems: boolean;
		CompleteStepButton?: string;
		ShowLoadingIndicator: boolean;
		LoadingIndicatorTitle?: string;
		LoadingIndicatorDurationMilliseconds?: number;
		ShowTermsAndConditions?: boolean;
	};
	status: {
		completed: boolean;
		current: boolean;
	};
}

export interface IStepConfig {
	Title: string;
	Subtitle: string;
	Products: string[];
	Url: string;
	Type: EStepType;
	ShowLiveChat: boolean;
	AnalyticsPageId: string;
	ProgressBarLabel: string;
	BasketSwitches: boolean;
	BasketHistoricalItems: boolean;
	QuestionList?: IQuestion[];
	CompleteStepButton?: string;
	ShowLoadingIndicator: boolean;
	LoadingIndicatorTitle?: string;
	LoadingIndicatorDurationMilliseconds?: number;
	ShowTermsAndConditions?: boolean;
}

export interface IStepSubtitles {
	primaryMember: string;
	address: string;
	additionalMembers: string;
	termsConditions: string;
	vehicle: string;
}
