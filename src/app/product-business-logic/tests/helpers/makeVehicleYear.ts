import { RuleConfig, RuleInt } from 'pbl/models';

export function makeVehicleYear(ruleConfig: RuleConfig, direction: string): number {
	const currentYear = new Date().getFullYear();
	const ruleInt = ruleConfig.ruleInts.filter(i => i.max)[0];

	switch (direction) {
		case '<':
			return currentYear - ruleInt.max + 1;
		case '>':
			return currentYear - ruleInt.max - 1;
		case '=':
			return currentYear - ruleInt.max;
	}
}
