import * as consentActions from 'ukbc/actions/consent.actions';
import { IInitialState, IConsent } from 'ukbc/models';
import { IValidated } from 'shared/models';
import { validate } from 'shared/services/validator';
import { consentValidator } from 'ukbc/validation-rules';

import { getSessionStorageReducerState } from 'shared/helpers';
import { EYesNoType } from 'ukbc/enums';

const { DefaultPaperlessOption, DefaultEmailMarketingOption } = (<IInitialState>(<any>window).UKBC_initialState).ContentInformation.Journey;

const savedState: State = getSessionStorageReducerState('consent', true);

export type State = IValidated<IConsent>;

const validateConsent = (consent: IConsent): IValidated<IConsent> => validate(consentValidator, consent);

const initialState: State =
	savedState ||
	validateConsent({
		AgreeTermsAndConditions: true,
		AgreeEmail: DefaultEmailMarketingOption === 'Unset' ? null : EYesNoType.fromYesNoString(DefaultEmailMarketingOption),
		AgreePaperless: DefaultPaperlessOption === 'Unset' ? null : EYesNoType.fromYesNoString(DefaultPaperlessOption),
	});

export function reducer(state: State = initialState, action: consentActions.Actions): State {
	switch (action.type) {
		case consentActions.SET_EMAIL_CONSENT:
			return validateConsent({ ...state.model, AgreeEmail: action.payload });
		case consentActions.SET_DOCUMENTS_CONSENT:
			return validateConsent({ ...state.model, AgreePaperless: action.payload });
		default:
			return state;
	}
}

export const getConsent = (state: State) => state;
export const getMarketingConsent = (state: State) => state.model.AgreeEmail;
export const getPaperlessConsent = (state: State) => state.model.AgreePaperless;
