import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty } from 'scripts/utils';

export class VehicleMileageRule extends RuleBase {
	public RuleType = RuleType.VehicleMileage;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];

		if (this.productSelected(coverDetails)) {
			valid = this.ruleIntsValid(coverDetails.VehicleMileage);

			if (!valid) {
				if (!isNullOrEmpty(this.ruleConfig.productCode)) {
					productsToDeselect = [this.ruleConfig.productCode];
				}

				if (logResult) {
					console.log(`Vehilce mileage rule failed for product ${this.ruleConfig.productCode}`);
				}
			}
		}

		return {
			valid,
			productsToDeselect,
		};
	}
}
