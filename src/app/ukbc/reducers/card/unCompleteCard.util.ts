import { EDetailsCardType, EPaymentCardType } from 'ukbc/enums';

export function uncompleteCard(completedCards: (EDetailsCardType | EPaymentCardType)[], card: EDetailsCardType | EPaymentCardType) {
	return completedCards.filter((cardType) => cardType !== card);
}
