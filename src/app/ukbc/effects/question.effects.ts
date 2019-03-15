import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from 'ukbc/reducers';
import * as questionActions from 'ukbc/actions/question.actions';
import * as layoutActions from 'ukbc/actions/layout.actions';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { IQuestionState } from 'ukbc/models';

@Injectable()
export class QuestionEffects {
	constructor(private actions: Actions, private store: Store<fromRoot.State>, private analyticsService: CheckoutAnalyticsService) {}

	@Effect({ dispatch: false })
	questions$: Observable<{ action: Action; state: fromRoot.State }> = this.actions
		.ofType(questionActions.ANSWER_QUESTION, questionActions.ACTIVATE_NEXT_UNANSWERED_QUESTION, questionActions.ACTIVATE_QUESTION)
		.withLatestFrom(this.store)
		.map(([action, state]) => {
			return { action, state };
		})
		.do(({ action, state }) => {
			const questions = state.questions.questions;

			switch (action.type) {
				case questionActions.ANSWER_QUESTION: {
					const currentActiveQuestion = questions.find(q => q.Active);

					setTimeout(() => {
						this.store.dispatch(new questionActions.ActivateNextUnansweredQuestion());
					}, currentActiveQuestion.Index === 0 ? 0 : 500);

					this.analyticsService.TrackQuestionAnswered(state, (<questionActions.AnswerQuestion>action).Id);
					break;
				}
				case questionActions.ACTIVATE_QUESTION:
				case questionActions.ACTIVATE_NEXT_UNANSWERED_QUESTION: {
					let question: IQuestionState;

					if (action.type === questionActions.ACTIVATE_NEXT_UNANSWERED_QUESTION) {
						question = questions.find(q => !q.Answered && !q.Hidden);
					} else {
						question = questions.find(q => q.Id === (<questionActions.ActivateQuestion>action).Id);
					}

					if (question && question.ShowBasketOnActivate) {
						this.store.dispatch(new layoutActions.ShowBasketAction());
					}

					if (question && question.IsBasis) {
						this.store.dispatch(new layoutActions.ShowBasketBasisItemAction());
					}

					if (question && question.ShowProgressBarOnActivate) {
						this.store.dispatch(new layoutActions.ShowQuestionsProgress());
					}

					this.analyticsService.TrackQuestionActivated(state, question.Id);
					break;
				}
			}
		});
}
