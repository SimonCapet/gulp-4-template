import { ICardStatus, ICard } from 'ukbc/models';
import { EDetailsCardType, EPaymentCardType } from 'ukbc/enums';

export function isSectionCardComplete(state: ICardStatus, cardType: EDetailsCardType | EPaymentCardType): boolean {
	return state.completedCardTypes.includes(cardType);
}
