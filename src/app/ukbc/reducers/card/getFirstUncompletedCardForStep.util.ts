import { ICardStatus, ICard } from 'ukbc/models';
import { EStepType } from 'ukbc/enums';

export function getFirstUncompletedCard(state: ICardStatus): ICard {
	const visibleCards = state.cards.filter(card => card.visible);
	const uncompletedCards = visibleCards.filter(card => card.visible && !card.readonly && !state.completedCardTypes.includes(card.type));
	return uncompletedCards[0];
}
