import { ICard } from 'ukbc/models';

export function getCardsVisibleOrReadonlyUtil(stateCards: ICard[]): ICard[] {
	return stateCards.filter(card => card.visible || card.readonly);
}
