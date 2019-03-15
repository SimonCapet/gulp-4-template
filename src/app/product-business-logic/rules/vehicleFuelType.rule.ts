import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty } from 'scripts/utils';

export class VehicleFuelTypeRule extends RuleBase {
	public RuleType = RuleType.VehicleFuelType;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];

		if (this.productSelected(coverDetails)) {
			valid = this.ruleConfig.ruleStrings.includes(coverDetails.VehicleFuelType);

			if (!valid) {
				if (!isNullOrEmpty(this.ruleConfig.productCode)) {
					productsToDeselect = [this.ruleConfig.productCode];
				}

				if (logResult) {
					console.log(
						`Vehilce fuel type rule failed on ${this.ruleConfig.productCode} because ${coverDetails.VehicleFuelType} is not allowed`
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
