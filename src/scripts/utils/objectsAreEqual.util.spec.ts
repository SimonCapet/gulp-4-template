import { objectsAreEqual } from 'scripts/utils';

describe('objectsAreEqual tests', () => {
	it('objectsAreEqual should return true for identical objects', () => {
		// Arrange
		const source = {
			a: 'b',
			b: {
				aa: 1,
				bb: ['a', 1, {}],
			},
			c: false,
			d: ['a', 1, {}],
			e: undefined,
		};
		const expected = true;

		// Act
		const result = objectsAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('objectsAreEqual should return true for identical empty objects', () => {
		// Arrange
		const source = {};
		const expected = true;

		// Act
		const result = objectsAreEqual(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('objectsAreEqual should return false for objects where an array value is different', () => {
		// Arrange
		const sourceA = {
			a: 'b',
			b: {
				aa: 1,
				bb: ['a', 1, {}],
			},
			c: false,
			d: ['a', 1, {}],
			e: undefined,
		};

		const sourceB = {
			a: 'b',
			b: {
				aa: 1,
				bb: ['a', 2, {}],
			},
			c: false,
			d: ['a', 1, {}],
			e: undefined,
		};
		const expected = false;

		// Act
		const result = objectsAreEqual(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});
});
