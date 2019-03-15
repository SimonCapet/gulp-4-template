import { IInitialState } from 'ukbc/models';
import { IAddress } from 'shared/models';
import { IInitialContact } from 'ukbc/models/contact.model';
const content = <IInitialState>(<any>window).UKBC_initialState;

export type State = IInitialState;

const initialState: State = { ...content };

export function reducer(state: State = initialState): State {
	return state;
}

export const getContent = (state: State) => state;

export const getGeneralContent = (state: State) => state.ContentInformation.GeneralInfo;

export const getPackageContent = (state: State) => state.ContentInformation.Package;

export const getLiveChatContent = (state: State) => state.ContentInformation.LiveChat;

export const getErrorsContent = (state: State) => state.ContentInformation.ErrorInfo;

export const getJourneyContent = (state: State) => state.ContentInformation.Journey;

export const getOffer = (state: State) => state.ContentInformation.Offer;

export const getAPIURLs = (state: State) => state.ApiUrls;

export const getPreSelectedContacts = (state: State): IInitialContact[] | undefined => state.PreSelectedContacts;

export const getPreSelectedAddress = (state: State): IAddress | undefined => state.PreSelectedAddress;

export const getIsRenewal = (state: State): boolean => state.IsRenewal;
