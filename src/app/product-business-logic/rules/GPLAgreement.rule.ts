import { RuleBase } from 'pbl/rules';
import { ICoverDetails, RuleConfig, IRuleResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty } from 'scripts/utils';

export class GPLAgreementRule extends RuleBase {
	public RuleType = RuleType.GPLAgreement;

	constructor(ruleConfig: RuleConfig) {
		super(ruleConfig);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		let valid = true;
		let productsToDeselect: string[];
		let moreInfoMode: MoreInfoMode;

		if (this.productSelected(coverDetails)) {
			valid = coverDetails.GPLAgreement;

			if (!valid) {
				moreInfoMode = MoreInfoMode.GPLAgreement;

				if (!isNullOrEmpty(this.ruleConfig.productCode)) {
					productsToDeselect = [this.ruleConfig.productCode];
				}

				if (logResult) {
					console.log(`GPL Agreement rule failed on ${this.ruleConfig.productCode}`);
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
