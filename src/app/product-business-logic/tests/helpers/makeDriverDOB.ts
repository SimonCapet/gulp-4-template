import { RuleConfig, RuleInt } from 'pbl/models';

export function makeDriverDOB(ruleConfig: RuleConfig, direction: string): Date {
	const minAge = ruleConfig.ruleInts.filter(i => i.min)[0].min;
	const dob = new Date();

	switch (direction) {
		case '<':
			dob.setFullYear(dob.getFullYear() - minAge + 1);
			break;
		case '>':
			dob.setFullYear(dob.getFullYear() - minAge - 1);
			break;
		case '=':
			dob.setFullYear(dob.getFullYear() - minAge);
			break;
	}

	return dob;
}
