import { isNullOrEmpty, valuesAreEqual } from './';

export function objectsAreEqual(objA: Object, objB: Object): boolean {
	if ((isNullOrEmpty(objA) && !isNullOrEmpty(objB)) || (!isNullOrEmpty(objA) && isNullOrEmpty(objB))) {
		return false;
	}

	let equal = true;
	for (const key in objA) {
		if (objA.hasOwnProperty(key) && objB.hasOwnProperty(key)) {
			equal = valuesAreEqual(objA[key], objB[key]);
			if (!equal) {
				break;
			}
		} else {
			equal = false;
			break;
		}
	}

	return equal;
}
