import { isUndefined } from 'scripts/utils';

describe('isUndefined tests', () => {
	it('isUndefined should return true for undefined variable', () => {
		// Arrange
		let source;
		const expected = true;

		// Act
		const result = isUndefined(source);

		// Assert
		expect(result).toBe(expected);
	});

	it('isUndefined should return false for defined variable', () => {
		// Arrange
		const source = 0;
		const expected = false;

		// Act
		const result = isUndefined(source);

		// Assert
		expect(result).toBe(expected);
	});

	it('isUndefined should return true for an undefined property', () => {
		// Arrange
		const source = {};
		const expected = true;

		// Act
		const result = isUndefined((<any>source).a);

		// Assert
		expect(result).toBe(expected);
	});

	it('isUndefined should return for a defined property', () => {
		// Arrange
		const source = {
			a: 0,
		};
		const expected = false;

		// Act
		const result = isUndefined((<any>source).a);

		// Assert
		expect(result).toBe(expected);
	});
});
