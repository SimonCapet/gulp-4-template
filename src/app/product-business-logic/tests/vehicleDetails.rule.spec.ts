// Used to enable use of the empty expected rule
// tslint:disable:prefer-const

// Polyfills
import 'core-js/fn/object/assign';
import 'core-js/modules/es6.string.includes.js';
import 'core-js/modules/es7.array.includes.js';

import { VehicleDetailsRule } from 'pbl/rules';
import { RuleType } from 'pbl/enums';
import { ICoverDetails, IRuleResult } from 'pbl/models';
import { getRuleByType, baseCoverDetails } from 'pbl/tests/helpers';

const rules: VehicleDetailsRule[] = getRuleByType(RuleType.VehicleDetails).map(c => new VehicleDetailsRule(c));

describe('Vehicle details Rule tests', () => {
	it('Vehicle details Rule should return true when product is not selected', () => {
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

	it('Vehicle details Rule should return false when VRN is not specified', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
		};
		const expected = false;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it('Vehicle details Rule should return true when VRN is specified', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VRN: 'A1',
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).valid;

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle details Rule shouldn't request for any products to be deselected when product is not selected`, () => {
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

	it('Vehicle details Rule should reqeuest for 980 to be removed when 980 is selected and VRN is not specified', () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
		};
		const expected = true;

		// Act
		const result = rule.Passed(source, false).productsToDeselect.includes('980');

		// Assert
		expect(result).toBe(expected);
	});

	it(`Vehicle details Rule shouldn't request for any products to be deselected when VRN is specified`, () => {
		// Arrange
		const rule = rules.filter(r => r.ruleConfig.productCode === '980')[0];
		const source: ICoverDetails = {
			...baseCoverDetails,
			SelectedProductCodes: ['RR', 'PBM', 'PBM1', '980'],
			VRN: 'A1',
		};

		let expected;

		// Act
		const result = rule.Passed(source, false).productsToDeselect;

		// Assert
		expect(result).toBe(expected);
	});
});
