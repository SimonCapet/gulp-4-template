import { ICard } from 'ukbc/models';
import { ECardCategory, EDetailsCardType, EPaymentCardType } from 'ukbc/enums';

export function getVisibleCards(cards: ICard[]): ICard[] {
	return cards.filter(card => card.visible);
}

export function getCardsForOtherCategories(cards: ICard[], category: ECardCategory): ICard[] {
	return cards.filter(card => card.category !== category);
}

export function getCardsBeforeCurrent(cards: ICard[], card: ICard): ICard[] {
	const cardIndex = cards.findIndex((cardValue) => cardValue.type === card.type);

	return cards.filter((c: ICard, index: number) => index < cardIndex);
}

export function getCardByType(cards: ICard[], type: EDetailsCardType | EPaymentCardType): ICard {
	return cards.find(card => card.type === type);
}
