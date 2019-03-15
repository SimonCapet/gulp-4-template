// Used to enable use of the empty expected rule
// tslint:disable:prefer-const

// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { DriverAgeRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails, makeDriverDOB } from 'pbl/tests/helpers';

const rules: DriverAgeRule[] = getRuleByType(RuleType.DriverAge).map(c => new DriverAgeRule(c));

describe('Vehicle Age Rule tests', () => {
	it('Vehicle Age Rule should return true when product is not selected', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1'],
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Age Rule should return true when driver age is greater than min', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '972'],
			DriverDOB: makeDriverDOB(rule.ruleConfig, '>'),
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Age Rule should return true when driver age is equal to min', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '972'],
			DriverDOB: makeDriverDOB(rule.ruleConfig, '='),
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Age Rule should return false when driver age is less than min', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '972'],
			DriverDOB: makeDriverDOB(rule.ruleConfig, '<'),
		};
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Age Rule shouldn't request for any products to be deselected when product is not selected`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1'],
		};
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Age Rule shouldn't request for any products to be deselected when driver age is greater than min`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '972'],
			DriverDOB: makeDriverDOB(rule.ruleConfig, '>'),
		};
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Age Rule shouldn't request for any products to be deselected when driver age is equal to min`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '972'],
			DriverDOB: makeDriverDOB(rule.ruleConfig, '='),
		};
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Age Rule should request for 972 to be deselected when driver age is less than min', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '972')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '972'],
			DriverDOB: makeDriverDOB(rule.ruleConfig, '<'),
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('972');

		// Assert
		expect(result).toBe(expected);
	});
});
