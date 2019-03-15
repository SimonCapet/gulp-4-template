import * as cardActions from 'ukbc/actions/card.actions';
import * as contactActions from 'ukbc/actions/contact.actions';
import * as vehicleActions from 'ukbc/actions/vehicle.actions';
import { ICardStatus, IInitialState, IJourneyContent } from 'ukbc/models';
import { getSessionStorageReducerState } from 'shared/helpers';
import { replaceCardsInCategory } from 'ukbc/reducers/card/replaceCardsInCategory';
import { getNextCard } from 'ukbc/reducers/card/getNextCard.util';
import { getCardByType } from 'ukbc/reducers/card/filterCards.util';
import { setCardVisibility } from 'ukbc/reducers/card/setCardVisibility.util';
import { getFirstUncompletedCard } from 'ukbc/reducers/card/getFirstUncompletedCardForStep.util';
import { invalidateCardsInCategory } from 'ukbc/reducers/card/invalidateCardsForStep.util';
import { getCardsVisibleUtil } from 'ukbc/reducers/card/getCardsVisible.util';
import { setOpenCard } from 'ukbc/reducers/card/setOpenCard';
import { ECardCategory, EDetailsCardType, EPaymentCardType } from 'ukbc/enums';
import { CreateInitialVehicles } from 'ukbc/reducers/vehicles/createInitialVehicles.util';
import { setPrefilledCard } from './setPrefilledCard';
import { getCardsVisibleOrReadonlyUtil } from 'ukbc/reducers/card/getCardsVisibleOrReadonly.util';
import { uncompleteCard } from 'ukbc/reducers/card/unCompleteCard.util';

export type State = ICardStatus;

const savedState: State = getSessionStorageReducerState('card', true);

const content: IInitialState = (<any>window).UKBC_initialState;
const Journey = <IJourneyContent>(<any>window).UKBC_initialState.ContentInformation.Journey;
const completedCards = [];

if (content.PreSelectedAddress) {
	completedCards.push(EDetailsCardType.Address);
}

if (content.PreSelectedContacts && content.PreSelectedContacts.length > 0) {
	completedCards.push(EDetailsCardType.Members);
}

if (content.PreSelectedCoverStartDate || Journey.HideCoverStartDate) {
	completedCards.push(EPaymentCardType.CoverStartDate);
}

if (content.PreSelectedVehicles && content.PreSelectedVehicles.length > 0) {
	completedCards.push(EDetailsCardType.Vehicles);
}

const initialState: State = savedState || {
	cards: [
		{ type: EDetailsCardType.Members, category: ECardCategory.Details, visible: true },
		{ type: EDetailsCardType.Address, category: ECardCategory.Details, visible: true },
		{ type: EDetailsCardType.Vehicles, category: ECardCategory.Details, visible: CreateInitialVehicles().length > 0, prefilled: false },
		{
			type: EPaymentCardType.CoverStartDate,
			category: ECardCategory.Payment,
			visible: true,
			readonly: Journey.HideCoverStartDate || content.IsRenewal,
		},
		{ type: EPaymentCardType.PaymentDetails, category: ECardCategory.Payment, visible: !Journey.HidePaymentDetails },
		{ type: EPaymentCardType.CardPayment, category: ECardCategory.Payment, visible: true },
	],
	openCardType: null,
	completedCardTypes: completedCards,
};

export function reducer(state: State = initialState, action: cardActions.Actions | contactActions.Actions | vehicleActions.Actions): State {
	switch (action.type) {
		case cardActions.SET_CARDS_FOR_CATEGORY: {
			return { ...state, cards: replaceCardsInCategory(state.cards, action.payload.cards, action.payload.category) };
		}
		case cardActions.OPEN_CARD: {
			return setOpenCard(state, action.payload);
		}
		case cardActions.CALCULATE_NEXT_OPEN_CARD: {
			const currentCard = getCardByType(state.cards, action.payload);
			const nextOpenCard = getNextCard(state.cards, currentCard, state.completedCardTypes);
			return { ...state, openCardType: nextOpenCard.type };
		}
		case cardActions.COMPLETE_CARD: {
			const currentCard = getCardByType(state.cards, action.payload);
			const nextCard = getNextCard(state.cards, currentCard, state.completedCardTypes);
			const completedCardTypes = state.completedCardTypes.includes(currentCard.type)
				? state.completedCardTypes
				: [...state.completedCardTypes, currentCard.type];

			return { ...state, openCardType: nextCard.type, completedCardTypes };
		}
		case cardActions.SET_CARD_VISIBILITY: {
			return setCardVisibility(state, action.payload.type, action.payload.visible, action.payload.dontGoToNextCard);
		}
		case cardActions.OPEN_FIRST_UNCOMPLETED_CARD: {
			return { ...state, openCardType: getFirstUncompletedCard(state).type };
		}
		case cardActions.INVALIDATE_CARDS_IN_CATEGORY: {
			return invalidateCardsInCategory(state, action.payload);
		}
		case cardActions.PREFILL_CARD: {
			return setPrefilledCard(state, action.payload);
		}
		case cardActions.UNCOMPLETE_CARD: {
			return {
				...state, completedCardTypes: uncompleteCard(state.completedCardTypes, action.payload)
			}
		}
		default: {
			return state;
		}
	}
}

export const getCardStatus = (state: State) => state;
export const getOpenCard = (state: State) => state.cards.find(card => card.type === state.openCardType);
export const getCardsVisible = (state: State) => getCardsVisibleUtil(state.cards);
export const getCardsVisibleOrReadonly = (state: State) => getCardsVisibleOrReadonlyUtil(state.cards);
export const getCards = (state: State) => state.cards;
export const getCompletedCards = (state: State) => state.completedCardTypes;
