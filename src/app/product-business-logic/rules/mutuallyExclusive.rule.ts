import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType } from 'pbl/enums';
import { isUndefined, arraysShareItem } from 'scripts/utils';

export class MutuallyExclusiveRule extends RuleBase {
	public RuleType = RuleType.MutuallyExclusive;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];

		if (!isUndefined(this.ruleConfig.ruleStrings) && this.ruleConfig.ruleStrings.length > 0 && this.productSelected(coverDetails)) {
			valid = !arraysShareItem(this.ruleConfig.ruleStrings, coverDetails.SelectedProductCodes);

			if (!valid) {
				productsToDeselect = this.ruleConfig.ruleStrings.filter(s => !coverDetails.SelectedProductCodes.includes(s));

				if (logResult) {
					console.log(
						`Mutually Exclusive Rule failed for ${this.ruleConfig.productCode} because ${productsToDeselect} shouldn't be selected`
					);
				}
			}
		}

		return {
			valid,
			productsToDeselect,
		};
	}
}
