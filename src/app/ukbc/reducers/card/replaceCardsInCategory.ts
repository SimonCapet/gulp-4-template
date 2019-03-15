import { ICard } from 'ukbc/models';
import { getCardsForOtherCategories } from 'ukbc/reducers/card/filterCards.util';
import { cardCategorySortOrder, ECardCategory } from 'ukbc/enums';

export function replaceCardsInCategory(stateCards: ICard[], newCards: ICard[], category: ECardCategory): ICard[] {
	const otherStepCards = getCardsForOtherCategories(stateCards, category);
	return [...otherStepCards, ...newCards].sort(
		(cardA, cardB) => cardCategorySortOrder[cardA.category] - cardCategorySortOrder[cardB.category]
	);
}
