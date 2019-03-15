import { arraysAreEqual, objectsAreEqual } from './';

export function valuesAreEqual(valA: any, valB: any): boolean {
	const valAType = typeof valA;
	const valBType = typeof valB;

	if (valAType === valBType) {
		switch (valAType) {
			case 'object':
				if (Array.isArray(valA)) {
					return arraysAreEqual(valA, valB);
				} else {
					return objectsAreEqual(valA, valB);
				}
			default:
				return valA === valB;
		}
	} else {
		return false;
	}
}
