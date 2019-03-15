import { MoreInfoMode, RuleType } from 'pbl/enums';

export interface IValidationResult {
	valid: boolean;
	productsToDeselect: string[];
	moreInfoRequired: MoreInfoMode[];
	failedRules: RuleType[];
}
