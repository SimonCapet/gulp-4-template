import { setOpenCard } from 'ukbc/reducers/card/setOpenCard';
import { ICardStatus } from 'ukbc/models';
import { CardType } from 'ukbc/models/card.model';

export const openCardIfBeforeCurrentOpen = (state: ICardStatus, type: CardType) => {
	const cardIndex = state.cards.findIndex(card => card.type === type);
	const openCardIndex = state.cards.findIndex(card => card.type === state.openCardType);
	if (cardIndex !== -1 && (cardIndex < openCardIndex || openCardIndex === -1)) {
		return setOpenCard(state, type);
	} else {
		return state;
	}
};
