import { ICardStatus } from 'ukbc/models';
import { ECardCategory, EStepType } from 'ukbc/enums';

export function invalidateCardsInCategory(state: ICardStatus, category: ECardCategory): ICardStatus {
	const newState = { ...state };

	const completedCards = newState.cards.filter(card => newState.completedCardTypes.includes(card.type));

	newState.completedCardTypes = completedCards.filter(card => card.category !== category).map(card => card.type);

	const openCard = newState.cards.find(card => card.type === newState.openCardType);

	if (openCard && openCard.category === category) {
		newState.openCardType = newState.cards.find(card => card.category === category && !card.readonly).type;
	}

	return newState;
}
