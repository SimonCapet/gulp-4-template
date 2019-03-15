import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty } from 'scripts/utils';

export class VehicleDetailsRule extends RuleBase {
	public RuleType = RuleType.VehicleDetails;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];
		let moreInfoMode: MoreInfoMode;

		if (this.productSelected(coverDetails)) {
			valid = !isNullOrEmpty(coverDetails.VRN);

			if (!valid) {
				moreInfoMode = MoreInfoMode.VehicleDetails;

				if (!isNullOrEmpty(this.ruleConfig.productCode)) {
					productsToDeselect = [this.ruleConfig.productCode];
				}

				if (logResult) {
					console.log(`Vehicle details rule failed on ${this.ruleConfig.productCode}`);
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
