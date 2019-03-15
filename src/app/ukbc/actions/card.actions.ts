import { Action } from '@ngrx/store';
import { ICard } from 'ukbc/models';
import { ECardCategory, EDetailsCardType, EPaymentCardType, EStepType } from 'ukbc/enums';

export const SET_CARDS_FOR_CATEGORY = '[Card] Set cards for category';
export const OPEN_CARD = '[Card] Open card';
export const CALCULATE_NEXT_OPEN_CARD = '[Card] Calculate next open card';
export const COMPLETE_CARD = '[Card] Complete card';
export const UNCOMPLETE_CARD = '[Card] Uncomplete card';
export const SET_CARD_VISIBILITY = '[Card] Set card visibility';
export const OPEN_FIRST_UNCOMPLETED_CARD = '[Card] Open first uncompleted card';
export const INVALIDATE_CARDS_IN_CATEGORY = '[Card] Invalidate cards in category';
export const PREFILL_CARD = '[Card] Prefill card';

export class SetCardsForCategory implements Action {
	readonly type = SET_CARDS_FOR_CATEGORY;
	constructor(public payload: { cards: ICard[]; category: ECardCategory }) {}
}

export class OpenCard implements Action {
	readonly type = OPEN_CARD;
	constructor(public payload: EDetailsCardType | EPaymentCardType) {}
}

export class CalculateNextOpenCard implements Action {
	readonly type = CALCULATE_NEXT_OPEN_CARD;
	constructor(public payload: EDetailsCardType | EPaymentCardType) {}
}

export class CompleteCard implements Action {
	readonly type = COMPLETE_CARD;
	constructor(public payload: EDetailsCardType | EPaymentCardType) {}
}

export class UncompleteCard implements Action {
	readonly type = UNCOMPLETE_CARD;
	constructor(public payload: EDetailsCardType | EPaymentCardType) {}
}

export class PrefillCard implements Action {
	readonly type = PREFILL_CARD;
	constructor(public payload: EDetailsCardType | EPaymentCardType) {}
}

export class SetCardVisibility implements Action {
	readonly type = SET_CARD_VISIBILITY;
	constructor(public payload: { type: EDetailsCardType | EPaymentCardType; visible: boolean; dontGoToNextCard?: boolean }) {}
}

export class OpenFirstUncompletedCard implements Action {
	readonly type = OPEN_FIRST_UNCOMPLETED_CARD;
}

export class InvalidateCardsInCategory implements Action {
	readonly type = INVALIDATE_CARDS_IN_CATEGORY;
	constructor(public payload: ECardCategory) {}
}

export type Actions =
	| SetCardsForCategory
	| OpenCard
	| CalculateNextOpenCard
	| CompleteCard
	| UncompleteCard
	| PrefillCard
	| SetCardVisibility
	| OpenFirstUncompletedCard
	| InvalidateCardsInCategory;
