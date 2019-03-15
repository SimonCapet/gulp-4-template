import { State } from 'ukbc/reducers/questions/questions.reducer';
import * as questionActions from 'ukbc/actions/question.actions';
import { IQuestionState } from 'ukbc/models';

export function showHideQuestion(
	state: State,
	action: questionActions.ShowQuestionByParentProduct | questionActions.HideQuestionByParentProduct,
	hide = false
): State {
	const newState = { ...state, questions: state.questions.map(s => <IQuestionState>{ ...s }) };
	const question = newState.questions.find(q => q.BasisParentProductCode === action.ParentProductCode);

	if (question) {
		if ((hide && !question.Hidden) || (!hide && question.Hidden)) {
			let wasActive = false;

			newState.questions.forEach(q => {
				if (q.BasisParentProductCode) {
					q.Hidden = !hide;

					if ((!hide && q.Id !== question.Id) || (hide && q.Id === question.Id)) {
						wasActive = q.Active;
					}

					if (hide && question.Active) {
						q.Active = true;
					}
				}
			});

			question.Hidden = hide;
			question.Active = wasActive;
		}

		return newState;
	} else {
		return state;
	}
}
