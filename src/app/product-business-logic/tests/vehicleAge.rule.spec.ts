// Used to enable use of the empty expected rule
// tslint:disable:prefer-const

// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { VehicleAgeRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails, makeVehicleYear } from 'pbl/tests/helpers';

const rules: VehicleAgeRule[] = getRuleByType(RuleType.VehicleAge).map(c => new VehicleAgeRule(c));

describe('Vehicle Age Rule tests', () => {
	it('Vehicle Age Rule should return true when product is not selected', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
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

	it('Vehicle Age Rule should return true when vehicle age is less than max', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleYear: makeVehicleYear(rule.ruleConfig, '<'),
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Age Rule should return false when vehicle age is greater than max', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];

		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleYear: makeVehicleYear(rule.ruleConfig, '>'),
		};
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Age Rule should return true when vehicle age is equal to max', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleYear: makeVehicleYear(rule.ruleConfig, '='),
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Age Rule shouldn't request for any products to be deselected when vehicle age is less than max`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleYear: makeVehicleYear(rule.ruleConfig, '<'),
		};
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Age Rule should request for 980 to be deslected when 980 selected and vehicle age is greater than max', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];

		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleYear: makeVehicleYear(rule.ruleConfig, '>'),
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('980');

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Age Rule shouldn't request for any products to be deselected when vehicle age is equal to max`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleYear: makeVehicleYear(rule.ruleConfig, '='),
		};
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});
});
