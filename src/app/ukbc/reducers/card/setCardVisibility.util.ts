import { ICardStatus, ICard } from 'ukbc/models';
import { EDetailsCardType, EPaymentCardType } from 'ukbc/enums';
import { getCardByType } from 'ukbc/reducers/card/filterCards.util';
import { getCompletedCardTypes } from 'ukbc/reducers/card/getCompletedCards.util';
import { getNextCard } from 'ukbc/reducers/card/getNextCard.util';

export function setCardVisibility(
	state: ICardStatus,
	cardType: EDetailsCardType | EPaymentCardType,
	visible: boolean,
	dontGoToNextCard = false
): ICardStatus {
	const newState = { ...state };
	const existingCard = getCardByType(newState.cards, cardType);

	if (existingCard == null) {
		return state;
	}

	newState.cards[newState.cards.indexOf(existingCard)] = { ...existingCard, visible };

	const currentOpenCardIndex = state.cards.findIndex(card => card.type === state.openCardType);
	const modifiedCardIndex = state.cards.findIndex(card => card.type === existingCard.type);

	if (visible && !existingCard.visible && modifiedCardIndex < currentOpenCardIndex) {
		newState.openCardType = cardType;
		newState.completedCardTypes = getCompletedCardTypes(newState, existingCard);

		return newState;
	}

	// TODO is this needed?
	// // Covers going from many vehicles / contacts to few and then back to many
	// if (visible && existingCard.visible) {
	// 	newState.completedCards = getCompletedCardsOnceVisible(newState, existingCard);
	//
	// 	return newState;
	// }

	if (!visible && existingCard.visible) {
		if (!dontGoToNextCard) {
			newState.openCardType = getNextCard(newState.cards, existingCard, state.completedCardTypes).type;
		}

		if (cardIsCompleted(newState, existingCard)) {
			newState.completedCardTypes = newState.completedCardTypes.filter(type => type !== existingCard.type);
		}

		return newState;
	}

	return state;
}

function cardIsCompleted(state: ICardStatus, cardToFind: ICard) {
	return state.completedCardTypes.find(cardType => cardType === cardToFind.type);
}
