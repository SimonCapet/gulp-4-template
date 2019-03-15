// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { MutuallyExclusiveRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails } from 'pbl/tests/helpers';

const rules: MutuallyExclusiveRule[] = getRuleByType(RuleType.MutuallyExclusive).map(c => new MutuallyExclusiveRule(c));

describe('Mutually Exclusive Rule tests', () => {
	it('Mutually Exclusive Rule should return true when PBM1 is selected and VBM1 is not', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === 'VBM1')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Mutually Exclusive Rule should return false when PBM1 and VBM1 is selected', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'VBM1'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === 'VBM1')[0];
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});
});
