import { RuleConfig, ICoverDetails, IRuleResult } from 'pbl/models';
import { RuleType } from 'pbl/enums';
import { isUndefined, isNullOrEmpty } from 'scripts/utils';

export class RuleBase {
	public RuleType: RuleType;
	public ruleConfig: RuleConfig;
	protected appliesToAllProducts: boolean;

	constructor(ruleConfig: RuleConfig) {
		this.ruleConfig = ruleConfig;
		this.appliesToAllProducts = isNullOrEmpty(this.ruleConfig.productCode);
	}

	public Passed(coverDetails: ICoverDetails, logResult = true): IRuleResult {
		return {
			valid: true,
		};
	}

	public Selectable(coverDetails: ICoverDetails, productCode: string): boolean {
		const coverWithProductSelected = {
			...coverDetails,
			SelectedProductCodes: [...coverDetails.SelectedProductCodes],
		};

		if (!this.productSelected(coverWithProductSelected, productCode)) {
			coverWithProductSelected.SelectedProductCodes.push(productCode);
		}

		return this.Passed(coverWithProductSelected, false).valid;
	}

	public AppliesToProduct(productCode: string) {
		return this.appliesToAllProducts || this.ruleConfig.productCode === productCode;
	}

	protected productSelected(coverDetails: ICoverDetails, productCode = this.ruleConfig.productCode): boolean {
		return coverDetails.SelectedProductCodes.includes(productCode);
	}

	protected ruleIntsValid(value: number): boolean {
		if (!this.ruleConfig.ruleInts.length) {
			return true;
		}

		let valid = true;

		this.ruleConfig.ruleInts.forEach(r => {
			if (!isUndefined(r.min) && value < r.min) {
				valid = false;
				return;
			}

			if (!isUndefined(r.max) && value > r.max) {
				valid = false;
				return;
			}
		});

		return valid;
	}
}
