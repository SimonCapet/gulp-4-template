// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { PrerequisiteRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails } from 'pbl/tests/helpers';

const rules: PrerequisiteRule[] = getRuleByType(RuleType.Prerequisite).map(c => new PrerequisiteRule(c));

describe('Prerequisite Rule tests', () => {
	it('Prerequisite Rule should return true when 980 (GPL) and R selected', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Prerequisite Rule should return false when 980 (GPL) selected and without R selected', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Prerequisite Rule should request 980 (GPL) to be deselected when 980 is selected but R is not', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = '980';

		// Act
		const result = rule.Passed(source, false).productsToDeselect[0];

		// Assert
		expect(result).toBe(expected);
	});

	it('Prerequisite Rule with no specified product code should return true if at least one of the prerequisite products are selected', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '')[0];
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: [rule.ruleConfig.ruleStrings[0]] };

		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Prerequisite Rule with no specified product code should return false if none of the prerequisite products are selected', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '')[0];
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: [] };

		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});
});
