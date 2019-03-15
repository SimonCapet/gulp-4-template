import { ICard } from 'ukbc/models';

export function getNextCard(cards: ICard[], currentCard: ICard, completedCards?: string[]): ICard {
	return cards.find(
		(card: ICard, index: number) =>
			card.visible &&
			!card.readonly &&
			!card.prefilled &&
			card.type !== currentCard.type &&
			(completedCards && !completedCards.includes(card.type))
	);
}
