import { CONFIG } from 'pbl/config';
import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty } from 'scripts/utils';

export class PrerequisiteRule extends RuleBase {
	public RuleType = RuleType.Prerequisite;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = false;
		let productsToDeselect: string[];

		if (this.appliesToAllProducts || this.productSelected(coverDetails)) {
			valid = !this.ruleConfig.ruleStrings.every(r => !this.productSelected(coverDetails, r));
		} else {
			valid = true;
		}

		if (!valid) {
			if (!isNullOrEmpty(this.ruleConfig.productCode)) {
				productsToDeselect = [this.ruleConfig.productCode];
			}

			if (logResult) {
				// tslint:disable-next-line:max-line-length
				console.log(
					`Prerequisite rule failed because ${this.ruleConfig.productCode} requires ${JSON.stringify(
						this.ruleConfig.ruleStrings
					)} to be selected`
				);
			}
		}

		return {
			valid,
			productsToDeselect,
		};
	}
}
