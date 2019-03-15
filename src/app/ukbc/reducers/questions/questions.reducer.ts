import { IQuestionState } from 'ukbc/models';
import * as questionActions from 'ukbc/actions/question.actions';
import { getInitialState } from 'ukbc/reducers/questions/getInitialState';
import { showHideQuestion } from 'ukbc/reducers/questions/showHideQuestion';

export interface State {
	questions: IQuestionState[];
	canChange: boolean;
}

export function reducer(state: State = getInitialState(), action: questionActions.Actions): State {
	switch (action.type) {
		case questionActions.ACTIVATE_QUESTION: {
			if (state.canChange) {
				return { ...state, questions: state.questions.map(q => <IQuestionState>{ ...q, Active: q.Id === action.Id }) };
			} else {
				return state;
			}
		}
		case questionActions.ANSWER_QUESTION: {
			return { ...state, questions: state.questions.map(q => <IQuestionState>{ ...q, Answered: q.Answered || q.Id === action.Id }) };
		}
		case questionActions.SHOW_QUESTION_BY_PARENT_PRODUCT: {
			return showHideQuestion(state, action);
		}
		case questionActions.HIDE_QUESTION_BY_PARENT_PRODUCT: {
			return showHideQuestion(state, action, true);
		}
		case questionActions.ACTIVATE_NEXT_UNANSWERED_QUESTION: {
			const lastUnansweredQuestion = state.questions.find(q => !q.Hidden && !q.Answered);

			if (lastUnansweredQuestion) {
				return {
					...state,
					questions: state.questions.map(q => <IQuestionState>{ ...q, Active: q.Id === lastUnansweredQuestion.Id }),
					canChange: false,
				};
			}

			return state;
		}
		case questionActions.ENABLE_CHANGE_QUESTION: {
			return { ...state, canChange: true };
		}
	}

	return state;
}

export const getAllQuestions = (state: State) => state.questions;
export const getCanChangeQuestion = (state: State) => state.canChange;
