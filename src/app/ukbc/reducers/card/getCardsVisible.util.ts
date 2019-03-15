import { ICard } from 'ukbc/models';

export function getCardsVisibleUtil(stateCards: ICard[]): ICard[] {
	return stateCards.filter(card => card.visible);
}
