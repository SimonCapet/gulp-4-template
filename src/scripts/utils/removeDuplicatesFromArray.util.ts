export function removeDuplicatesFromArray(arr: any[]): any[] {
	return [].slice.call(new Set(arr));
}
