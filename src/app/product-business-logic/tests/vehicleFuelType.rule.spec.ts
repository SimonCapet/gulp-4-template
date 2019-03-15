// Used to enable use of the empty expected rule
// tslint:disable:prefer-const

// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { VehicleFuelTypeRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails } from 'pbl/tests/helpers';

const rules: VehicleFuelTypeRule[] = getRuleByType(RuleType.VehicleFuelType).map(c => new VehicleFuelTypeRule(c));

describe('Vehicle Fuel Type Rule tests', () => {
	it('Vehicle Fuel Type Rule should return true when product is not selected', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
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

	it('Vehicle Fuel Type Rule should return false when product is selected but fuel type has not yet been selected', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '971'],
		};
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Fuel Type Rule should return true when vehicle fuel type is allowed', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '971'],
			VehicleFuelType: 'Petrol',
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Fuel Type Rule should return false when vehicle fuel type is not allowed', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '971'],
			VehicleFuelType: 'Electric',
		};
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Fuel Type Rule shouldn't request any products to be deselected when product is not selected`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
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

	it('Vehicle Fuel Type Rule should request for 971 to be deseelcted when 971 is selected but fuel type has not yet been selected', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '971'],
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('971');

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle Fuel Type Rule shouldn't request any products to be deselected when vehicle fuel type is allowed`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '971'],
			VehicleFuelType: 'Petrol',
		};
		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle Fuel Type Rule should request for 971 to be deseelcted when 971 is selected and vehicle fuel type is not allowed', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '971')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '971'],
			VehicleFuelType: 'Electric',
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('971');

		// Assert
		expect(result).toBe(expected);
	});
});
