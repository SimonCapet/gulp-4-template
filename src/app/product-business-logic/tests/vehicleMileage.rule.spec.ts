// Used to enable use of the empty expected rule
// tslint:disable:prefer-const

// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { VehicleMileageRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails } from 'pbl/tests/helpers';

const rules: VehicleMileageRule[] = getRuleByType(RuleType.VehicleMileage).map(c => new VehicleMileageRule(c));

describe('Vehicle Mileage Rule tests', () => {
	it(`Vehicle Mileage Rule should return true when product isn't selected`, () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Mileage Rule should return true when mileage is less than max`, () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'], VehicleMileage: 10000 };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Mileage Rule should return false when mileage is greater than max`, () => {
		// Arrange
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'],
			VehicleMileage: 99999999,
		};
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Mileage Rule shouldn't request for any products to be deselected when product isn't selected`, () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R'] };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Mileage Rule shouldn't request for any products to be deselected when mileage is less than max`, () => {
		// Arrange
		const source: ICoverDetails = { ...baseCoverDetails, SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'], VehicleMileage: 10000 };
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		let expected;
		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Mileage Rule should request for 980 to be deselected when mileage is greater than max`, () => {
		// Arrange
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', 'R', '980'],
			VehicleMileage: 99999999,
		};
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('980');

		// Assert
		expect(result).toBe(expected);
	});
});
