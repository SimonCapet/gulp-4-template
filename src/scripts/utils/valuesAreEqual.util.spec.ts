import { valuesAreEqual } from 'scripts/utils';

describe('valuesAreEqual tests', () => {
	it('valuesAreEqual should return true for identical undefined', () => {
		// Arrange
		const source = undefined;
		const expected = true;

		// Act
		const result = valuesAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('valuesAreEqual should return false for undefined and value', () => {
		// Arrange
		const sourceA = undefined;
		const sourceB = '';
		const expected = false;

		// Act
		const result = valuesAreEqual(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});

	it('valuesAreEqual should return true for identical number', () => {
		// Arrange
		const source = 1;
		const expected = true;

		// Act
		const result = valuesAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('valuesAreEqual should return false for different number', () => {
		// Arrange
		const sourceA = 1;
		const sourceB = 2;
		const expected = false;

		// Act
		const result = valuesAreEqual(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});

	it('valuesAreEqual should return true for identical string', () => {
		// Arrange
		const source = 'yes';
		const expected = true;

		// Act
		const result = valuesAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('valuesAreEqual should return false for different strings', () => {
		// Arrange
		const sourceA = 'yes';
		const sourceB = 'no';
		const expected = false;

		// Act
		const result = valuesAreEqual(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});

	it('valuesAreEqual should return true for itendical empty objects', () => {
		// Arrange
		const source = {};
		const expected = true;

		// Act
		const result = valuesAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});
});
