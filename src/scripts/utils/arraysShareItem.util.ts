import 'core-js/modules/es7.array.includes.js';

export function arraysShareItem(arr1: any[], arr2: any[]): boolean {
	return arr1.some(item => arr2.includes(item));
}
