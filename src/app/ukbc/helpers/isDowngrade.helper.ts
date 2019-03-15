let isDowngrade = null;

export function IsDowngrade(): boolean {
	if (isDowngrade === null) {
		isDowngrade = !!sessionStorage.getItem('downgrade');
	}

	return isDowngrade;
}
