import { ICard, ICardStatus } from 'ukbc/models';
import { getCardsBeforeCurrent, getVisibleCards } from 'ukbc/reducers/card/filterCards.util';
import { CardType } from 'ukbc/models/card.model';

export function getCompletedCardTypes(state: ICardStatus, openCard: ICard): CardType[] {
	const cardsBeforeCurrent = getCardsBeforeCurrent(state.cards, openCard);
	const visibleCards = getVisibleCards(cardsBeforeCurrent);
	return visibleCards.map(card => card.type);
}
