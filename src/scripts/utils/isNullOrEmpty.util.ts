import { isUndefined } from './';

export function isNullOrEmpty(value: any): boolean {
	if (isUndefined(value) || value === null || value.length === 0) {
		return true;
	}

	return false;
}
