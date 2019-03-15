import { ECardCategory, EDetailsCardType, EPaymentCardType } from 'ukbc/enums';

export type CardType = EDetailsCardType | EPaymentCardType;

export interface ICardStatus {
	cards: ICard[];
	openCardType: CardType;
	completedCardTypes: CardType[];
}

export interface ICard {
	type: CardType;
	category: ECardCategory;
	visible?: boolean;
	readonly?: boolean;
	prefilled?: boolean;
}
