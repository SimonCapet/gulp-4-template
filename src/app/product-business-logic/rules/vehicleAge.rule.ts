import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty } from 'scripts/utils';

export class VehicleAgeRule extends RuleBase {
	public RuleType = RuleType.VehicleAge;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];

		if (!isNullOrEmpty(coverDetails.VehicleYear) && this.productSelected(coverDetails)) {
			valid = this.ruleIntsValid(new Date().getUTCFullYear() - coverDetails.VehicleYear);

			if (!valid) {
				if (!isNullOrEmpty(this.ruleConfig.productCode)) {
					productsToDeselect = [this.ruleConfig.productCode];
				}

				if (logResult) {
					console.log(`Vehicle age rule failed on ${this.ruleConfig.productCode}`);
				}
			}
		}

		return {
			valid,
			productsToDeselect,
		};
	}
}
