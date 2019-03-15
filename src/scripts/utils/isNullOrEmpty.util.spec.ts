import { isNullOrEmpty } from './';

describe('isNullOrEmpty tests', () => {
	it('isNullOrEmpty should return true for null value', () => {
		// Arrange
		const source = null;
		const expected = true;

		// Act
		const result = isNullOrEmpty(source);

		// Assert
		expect(result).toBe(expected);
	});

	it('isNullOrEmpty should return true for an empty string', () => {
		// Arrange
		const source = '';
		const expected = true;

		// Act
		const result = isNullOrEmpty(source);

		// Assert
		expect(result).toBe(expected);
	});

	it('isNullOrEmpty should return false for a string with content', () => {
		// Arrange
		const source = 'a';
		const expected = false;

		// Act
		const result = isNullOrEmpty(source);

		// Assert
		expect(result).toBe(expected);
	});

	it('isNullOrEmpty should return true for an undefined variable', () => {
		// Arrange
		let source;
		const expected = true;

		// Act
		const result = isNullOrEmpty(source);

		// Assert
		expect(result).toBe(expected);
	});

	it('isNullOrEmpty should return false for a number', () => {
		// Arrange
		const source = 0;
		const expected = false;

		// Act
		const result = isNullOrEmpty(source);

		// Assert
		expect(result).toBe(expected);
	});

	it('isNullOrEmpty should return false for an object', () => {
		// Arrange
		const source = {};
		const expected = false;

		// Act
		const result = isNullOrEmpty(source);

		// Assert
		expect(result).toBe(expected);
	});
});
