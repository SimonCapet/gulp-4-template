import { Action } from '@ngrx/store';

export const TOGGLE_BASKET_OPEN = '[Layout] Toggle Basket Open';
export const SHOW_BASKET = '[Layout] Show Basket';
export const SHOW_BASKET_BASIS_ITEM = '[Layout] Show basket basis item';
export const SET_SCROLL_OFFSET = '[Layout] Set scroll offset';
export const SHOW_QUESTIONS_PROGRESS = '[Layout] Show questions progress';

export class ToggleBasketOpenAction implements Action {
	readonly type = TOGGLE_BASKET_OPEN;
}

export class ShowBasketAction implements Action {
	readonly type = SHOW_BASKET;
}

export class ShowBasketBasisItemAction implements Action {
	readonly type = SHOW_BASKET_BASIS_ITEM;
}

export class SetScrollOffset implements Action {
	readonly type = SET_SCROLL_OFFSET;
	constructor(public offset: number) {}
}

export class ShowQuestionsProgress implements Action {
	readonly type = SHOW_QUESTIONS_PROGRESS;
}

export type Actions = ToggleBasketOpenAction | ShowBasketAction | ShowBasketBasisItemAction | SetScrollOffset | ShowQuestionsProgress;
