import { arrayContainsArray } from 'scripts/utils';

describe('arraysContainsArray tests', () => {
	it('arraysContainsArray should return true for mixed array', () => {
		// Arrange
		const source = [0, 'b'];
		const expected = true;

		// Act
		const result = arrayContainsArray(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('arrayContainsArray should return false for unequal mixed arrays', () => {
		// Arrange
		const sourceA = [0, 'b'];
		const sourceB = [1, 'b'];
		const expected = false;

		// Act
		const result = arrayContainsArray(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});

	it('arrayContainsArray should return true for mixed arrays match', () => {
		// Arrange
		const sourceA = [0, 'b'];
		const sourceB = ['b'];
		const expected = true;

		// Act
		const result = arrayContainsArray(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});

	it('arrayContainsArray should return false for mixed arrays no match', () => {
		// Arrange
		const sourceA = [0, 'b'];
		const sourceB = ['a'];
		const expected = false;

		// Act
		const result = arrayContainsArray(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});
});
