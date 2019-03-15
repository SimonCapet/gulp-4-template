import { Action } from '@ngrx/store';

export const ACTIVATE_QUESTION = '[Question] Activate';
export const ANSWER_QUESTION = '[Question] Answer';
export const ACTIVATE_NEXT_UNANSWERED_QUESTION = '[Question] Activate next unanswered';
export const SHOW_QUESTION_BY_PARENT_PRODUCT = '[Question] Show by parent product';
export const HIDE_QUESTION_BY_PARENT_PRODUCT = '[Question] Hide by parent product';
export const ENABLE_CHANGE_QUESTION = '[Question] Enable change';

export class ActivateQuestion implements Action {
	readonly type = ACTIVATE_QUESTION;
	constructor(public Id: string) {}
}

export class AnswerQuestion implements Action {
	readonly type = ANSWER_QUESTION;
	constructor(public Id: string) {}
}

export class ActivateNextUnansweredQuestion implements Action {
	readonly type = ACTIVATE_NEXT_UNANSWERED_QUESTION;
}

export class ShowQuestionByParentProduct implements Action {
	readonly type = SHOW_QUESTION_BY_PARENT_PRODUCT;
	constructor(public ParentProductCode: string) {}
}

export class HideQuestionByParentProduct implements Action {
	readonly type = HIDE_QUESTION_BY_PARENT_PRODUCT;
	constructor(public ParentProductCode: string) {}
}
export class EnableChangeQuestion implements Action {
	readonly type = ENABLE_CHANGE_QUESTION;
}

export type Actions =
	| ActivateQuestion
	| AnswerQuestion
	| ActivateNextUnansweredQuestion
	| ShowQuestionByParentProduct
	| HideQuestionByParentProduct
	| EnableChangeQuestion;

export const ActionTypes = [
	ACTIVATE_QUESTION,
	ANSWER_QUESTION,
	ACTIVATE_NEXT_UNANSWERED_QUESTION,
	SHOW_QUESTION_BY_PARENT_PRODUCT,
	HIDE_QUESTION_BY_PARENT_PRODUCT,
	ENABLE_CHANGE_QUESTION,
];
