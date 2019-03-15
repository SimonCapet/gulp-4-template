import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty } from 'scripts/utils';

export class VehicleCountRule extends RuleBase {
	public RuleType = RuleType.VehicleCount;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];

		if (this.productSelected(coverDetails)) {
			valid = this.ruleIntsValid(coverDetails.VehicleCount);

			if (!valid) {
				if (!isNullOrEmpty(this.ruleConfig.productCode)) {
					productsToDeselect = [this.ruleConfig.productCode];
				}

				if (logResult) {
					console.log(`Vehicle count rule failed on ${this.ruleConfig.productCode}`);
				}
			}
		}

		return {
			valid,
			productsToDeselect,
		};
	}
}
