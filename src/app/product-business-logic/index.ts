import { RuleConfig, ISuppliedRuleConfig, ICoverDetails, IValidationResult } from 'pbl/models';
import { RuleType, MoreInfoMode } from 'pbl/enums';
import { isNullOrEmpty, isUndefined, removeDuplicatesFromArray } from 'scripts/utils';
import {
	RuleBase,
	DriverAgeRule,
	MutuallyExclusiveRule,
	PrerequisiteRule,
	VehicleAgeRule,
	GPLAgreementRule,
	VehicleCountRule,
	VehicleDetailsRule,
	VehicleFuelTypeRule,
	VehicleMileageRule,
} from 'pbl/rules';
class CoverValidator {
	// State
	private productMap: Map<
		string,
		| DriverAgeRule[]
		| MutuallyExclusiveRule[]
		| PrerequisiteRule[]
		| VehicleAgeRule[]
		| GPLAgreementRule[]
		| VehicleCountRule[]
		| VehicleDetailsRule[]
		| VehicleFuelTypeRule[]
		| VehicleMileageRule[]
	> = new Map();

	private rules:
		| DriverAgeRule[]
		| MutuallyExclusiveRule[]
		| PrerequisiteRule[]
		| VehicleAgeRule[]
		| GPLAgreementRule[]
		| VehicleCountRule[]
		| VehicleDetailsRule[]
		| VehicleFuelTypeRule[]
		| VehicleMileageRule[] = [];

	// Functions
	constructor(suppliedRules: ISuppliedRuleConfig[] = (<any>window).ruleData, availableProducts: string[]) {
		// Convert rule configurations
		const ruleConfigs = suppliedRules.map(r => new RuleConfig(r));

		// Prepare product rules map
		availableProducts.forEach(p => this.productMap.set(p, []));

		this.rules = ruleConfigs.map(r => {
			const validator = this.getValidatorForRule(r);

			availableProducts.forEach(p => {
				if (validator.AppliesToProduct(p)) {
					this.productMap.set(p, [...this.productMap.get(p), validator]);
				}
			});
			return validator;
		});
	}

	private getValidatorForRule(ruleConfig: RuleConfig) {
		switch (ruleConfig.ruleType) {
			case RuleType.DriverAge:
				return new DriverAgeRule(ruleConfig);
			case RuleType.MutuallyExclusive:
				return new MutuallyExclusiveRule(ruleConfig);
			case RuleType.Prerequisite:
				return new PrerequisiteRule(ruleConfig);
			case RuleType.VehicleAge:
				return new VehicleAgeRule(ruleConfig);
			case RuleType.GPLAgreement:
				return new GPLAgreementRule(ruleConfig);
			case RuleType.VehicleCount:
				return new VehicleCountRule(ruleConfig);
			case RuleType.VehicleDetails:
				return new VehicleDetailsRule(ruleConfig);
			case RuleType.VehicleFuelType:
				return new VehicleFuelTypeRule(ruleConfig);
			case RuleType.VehicleMileage:
				return new VehicleMileageRule(ruleConfig);
		}
	}

	public CoverIsValid(coverDetails: ICoverDetails): IValidationResult {
		let valid = true;
		let productsToDeselect: string[] = [];
		let moreInfoRequired: MoreInfoMode[] = [];
		let failedRules: RuleType[] = [];

		(<any[]>this.rules).forEach((r: RuleBase) => {
			const result = r.Passed(coverDetails);

			if (!result.valid) {
				valid = false;
				failedRules = removeDuplicatesFromArray([...failedRules, r.RuleType]);
			}

			if (result.productsToDeselect && result.productsToDeselect.length) {
				productsToDeselect = removeDuplicatesFromArray([...productsToDeselect, ...result.productsToDeselect]);
			}

			if (!isUndefined(result.moreInfoMode)) {
				moreInfoRequired = removeDuplicatesFromArray([...moreInfoRequired, result.moreInfoMode]);
			}
		});

		return {
			valid,
			productsToDeselect,
			moreInfoRequired,
			failedRules,
		};
	}

	public ProductIsSelectable(coverDetails: ICoverDetails, productCode: string): boolean {
		const rules = <any[]>this.productMap.get(productCode);

		return rules.every((r: RuleBase) => {
			if (
				r.RuleType !== RuleType.MutuallyExclusive &&
				r.RuleType !== RuleType.VehicleDetails &&
				r.RuleType !== RuleType.VehicleMileage &&
				r.RuleType !== RuleType.VehicleAge &&
				r.RuleType !== RuleType.VehicleFuelType &&
				r.RuleType !== RuleType.GPLAgreement &&
				r.RuleType !== RuleType.VehicleCount
			) {
				return r.Selectable(coverDetails, productCode);
			}

			return true;
		});
	}
}

module.exports = CoverValidator;
