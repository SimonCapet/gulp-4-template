import { IValidated } from 'shared/models';
import { validate } from 'shared/services';
import { directDebitTermsAndConditionsValidator } from 'ukbc/validation-rules';

export function ValidateDirectDebitAgreeToTerms(preference: boolean): IValidated<boolean> {
	return validate(directDebitTermsAndConditionsValidator, preference);
}
