export function arrayContainsArray(superset: any[], subset: any[]): boolean {
	if (0 === subset.length || superset.length < subset.length) {
		return false;
	}

	for (let i = 0; i < subset.length; i++) {
		if (!superset.includes(subset[i])) {
			return false;
		}
	}

	return true;
}
