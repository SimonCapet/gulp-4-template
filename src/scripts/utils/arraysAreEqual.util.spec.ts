import { arraysAreEqual } from 'scripts/utils';

describe('arraysAreEqual tests', () => {
	it('arraysAreEqual should return true for mixed array', () => {
		// Arrange
		const source = [0, 'b', {}];
		const expected = true;

		// Act
		const result = arraysAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('arraysAreEqual should return false for unequal mixed arrays', () => {
		// Arrange
		const sourceA = [0, 'b', {}];
		const sourceB = [1, 'b', {}];
		const expected = false;

		// Act
		const result = arraysAreEqual(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});

	it('arraysAreEqual should return true for array with object that has no props changed', () => {
		// Arrange
		const source = [
			{
				a: 'yes',
				b: 'no',
			},
		];
		const expected = true;

		// Act
		const result = arraysAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('arraysAreEqual should return false for array with object that has  props changed', () => {
		// Arrange
		const sourceA = [
			{
				a: 'yes',
				b: 'no',
			},
		];
		const sourceB = [
			{
				a: 'no',
				b: 'no',
			},
		];
		const expected = false;

		// Act
		const result = arraysAreEqual(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});

	it('arraysAreEqual should return false for an undefined array', () => {
		// Arrange
		const sourceA: any[] = undefined;
		const sourceB = [
			{
				a: 'no',
				b: 'no',
			},
		];
		const expected = false;

		// Act
		const result = arraysAreEqual(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});
});
