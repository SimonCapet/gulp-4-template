import { IQuestionState, IStepConfig, IJourneyContent, IInitialState, IProduct } from 'ukbc/models';
import { getSessionStorageReducerState } from 'shared/helpers';
import { EStepType } from 'ukbc/enums';
import { State } from 'ukbc/reducers/questions/questions.reducer';

const savedState: State = getSessionStorageReducerState('questions', true);
const initialState: IInitialState = (<any>window).UKBC_initialState;
const journeyConfig: IJourneyContent = initialState.ContentInformation.Journey;
const productList: IProduct[] = initialState.ContentInformation.ProductList;
const steps = <IStepConfig[]>journeyConfig.Steps;

export function getInitialState(): State {
	if (savedState) {
		return savedState;
	}

	const questionsSteps = steps.filter(s => s.Type === EStepType.Questions);

	let questions: IQuestionState[] = [];

	if (questionsSteps) {
		questionsSteps.forEach(step => {
			const mappedStepQuestions: IQuestionState[] = step.QuestionList.map((question, Index) => {
				const stateObject: IQuestionState = { ...question, Active: false, Answered: false, Hidden: false, Index };

				if (question.BasisParentProductCode) {
					stateObject.Hidden = !productList.find(p => {
						return journeyConfig.PreSelectedProducts.includes(p.ProductCode) && p.ParentProduct === question.BasisParentProductCode;
					});
				}

				return stateObject;
			});

			questions = [...questions, ...mappedStepQuestions];
		});
	}

	return { questions, canChange: true };
}
