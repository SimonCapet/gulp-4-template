import { RuleType } from 'pbl/enums';

export interface ISuppliedRuleConfig {
	ruleId: string;
	ruleOrder: string;
	ruleType: string;
	productCode: string;
	optionFlags: string;
	ruleStrings: string[];
	ruleInts: ISuppliedRuleInt[];
}

interface ISuppliedRuleInt {
	min?: string;
	max?: string;
}

export class RuleInt {
	public min?: number;
	public max?: number;

	constructor(ruleInt: ISuppliedRuleInt) {
		if (ruleInt.min) {
			this.min = parseInt(ruleInt.min, 10);
		}

		if (ruleInt.max) {
			this.max = parseInt(ruleInt.max, 10);
		}
	}
}

export class RuleConfig {
	public ruleId: string;
	public ruleOrder: number;
	public ruleType: RuleType;
	public productCode?: string;
	public optionFlags: number;
	public ruleStrings: string[];
	public ruleInts: RuleInt[];

	constructor(config: ISuppliedRuleConfig) {
		this.ruleId = config.ruleId;
		this.ruleOrder = parseInt(config.ruleOrder, 10);
		this.ruleType = parseInt(config.ruleType, 10);
		this.productCode = config.productCode;
		this.optionFlags = parseInt(config.optionFlags, 10);
		this.ruleStrings = config.ruleStrings;
		this.ruleInts = config.ruleInts.map(r => new RuleInt(r));
	}
}
