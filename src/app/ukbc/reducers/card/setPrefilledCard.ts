import { State } from 'ukbc/reducers/card/card.reducer';
import { CardType } from 'ukbc/models/card.model';

export const setPrefilledCard = (state: State, type: CardType) => {
	const updatedCards = state.cards.map(card => {
		if (card.type === type) {
			card.prefilled = true;
		}
		return card;
	});

	return { ...state, cards: updatedCards };
};
