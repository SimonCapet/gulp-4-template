import { EYesNoType } from 'ukbc/enums';

export interface IConsent {
	AgreeTermsAndConditions: boolean;
	AgreeEmail: EYesNoType | null;
	AgreePaperless: EYesNoType | null;
}
