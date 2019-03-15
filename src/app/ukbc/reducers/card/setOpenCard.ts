import { getCardByType } from 'ukbc/reducers/card/filterCards.util';
import { State } from 'ukbc/reducers/card/card.reducer';
import { CardType } from 'ukbc/models/card.model';

export const setOpenCard = (state: State, type: CardType) => {
	const openCard = getCardByType(state.cards, type);
	return { ...state, openCardType: openCard.type };
};
