// Used to enable use of the empty expected rule
// tslint:disable:prefer-const

// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { VehicleCountRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails } from 'pbl/tests/helpers';

const rules: VehicleCountRule[] = getRuleByType(RuleType.VehicleCount).map(c => new VehicleCountRule(c));

describe('Vehicle count Rule tests', () => {
	it('Vehicle count Rule should return true when product is not selected', () => {
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

	it('Vehicle count Rule should return false when vehicle count is less than min', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleCount: 0,
		};
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle count Rule should return false when vehicle count is greater than max', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleCount: 2,
		};
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle count Rule should return false when vehicle count greater than min and less than max', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleCount: 1,
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle count Rule shouldn't request any products to be deselected when product is not selected`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
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

	it('Vehicle count Rule should request 980 to be deselected when 980 selected and vehicle count is less than min', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleCount: 0,
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('980');

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle count Rule should request 980 to be deselected when 980 selected and vehicle count is greater than max', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleCount: 2,
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('980');

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle count Rule shouldn't request any products to be deselected when vehicle count greater than min and less than max`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VehicleCount: 1,
		};

		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});
});
