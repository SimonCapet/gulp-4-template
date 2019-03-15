// Used to enable use of the empty expected rule
// tslint:disable:prefer-const

// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { GPLAgreementRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails } from 'pbl/tests/helpers';

const rules: GPLAgreementRule[] = getRuleByType(RuleType.GPLAgreement).map(c => new GPLAgreementRule(c));

describe('GPL Agreement Rule tests', () => {
	it(`GPL Agreement Rule should return true when GPL isn't selected`, () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('GPL Agreement Rule should return true when GPL is selected and GPL terms have been agreed to', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'], GPLAgreement: true };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('GPL Agreement Rule should return false when GPL is selected and GPL terms have not been agreed to', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`GPL Agreement Rule shouldn't request for any products to be deselected when GPL isn't selected`, () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it('GPL Agreement Rule should return true when GPL is selected and GPL terms have been agreed to', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'], GPLAgreement: true };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it('GPL Agreement Rule should request for GPL to be deslected when GPL is selected and GPL terms have not been agreed to', () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('980');

		// Assert
		expect(result).toBe(expected);
	});
});
