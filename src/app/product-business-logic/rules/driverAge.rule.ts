import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { calculateAgeInYears, isNullOrEmpty } from 'scripts/utils';
import { RuleType, MoreInfoMode } from 'pbl/enums';

export class DriverAgeRule extends RuleBase {
	private optionToDeselectIfInvalid: boolean;
	public RuleType = RuleType.DriverAge;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];
		let moreInfoMode: MoreInfoMode;

		if (this.appliesToAllProducts || this.productSelected(coverDetails)) {
			if (!isNullOrEmpty(coverDetails.DriverDOB)) {
				const age = calculateAgeInYears(coverDetails.DriverDOB);
				valid = this.ruleIntsValid(age);
			}

			if (!valid && !this.appliesToAllProducts && !isNullOrEmpty(this.ruleConfig.productCode)) {
				productsToDeselect = [this.ruleConfig.productCode];
			}
		}

		if (!valid) {
			if (!isNullOrEmpty(this.ruleConfig.productCode)) {
				moreInfoMode = MoreInfoMode.DriverAge;
			}

			if (logResult) {
				if (this.appliesToAllProducts) {
					console.log('Driver age rule failed on all products');
				} else {
					console.log(`Driver age rule failed for product code ${this.ruleConfig.productCode}`);
				}
			}
		}

		return {
			valid,
			productsToDeselect,
			moreInfoMode,
		};
	}
}
