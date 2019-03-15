import { arraysShareItem } from 'scripts/utils';

describe('arraysShareItem tests', () => {
	it('arraysShareItem should return true for arrays that share item', () => {
		// Arrange
		const source = [0, 'b', {}];
		const expected = true;

		// Act
		const result = arraysShareItem(source, source);

		// Assert
		expect(result).toBe(expected);
	});

	it('arraysShareItem should return false for arrays that do not share item', () => {
		// Arrange
		const sourceA = [0, 'b', {}];
		const sourceB = [1, 'a'];
		const expected = false;

		// Act
		const result = arraysShareItem(sourceA, sourceB);

		// Assert
		expect(result).toBe(expected);
	});
});
