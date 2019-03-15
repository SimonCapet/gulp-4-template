import { valuesAreEqual } from './';

export function arraysAreEqual(array1: any[], array2: any[]): boolean {
	if (!array1 || !array2 || array1.length !== array2.length) {
		return false;
	}

	return array1.every((itemA, index) => {
		const itemB = array2[index];
		return valuesAreEqual(itemA, itemB);
	});
}
