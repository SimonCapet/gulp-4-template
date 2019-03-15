export function punctuateList(list: string[], boldItems?: boolean, oxfordComma: boolean = true): string {
	if (boldItems) {
		list = list.map(item => `<strong>${item}</strong>`);
	}

	const listLength = list.length;

	if (listLength === 1) {
		return list[0];
	}

	if (listLength === 2) {
		return `${list[0]} and ${list[1]}`;
	}

	const commaItems = list.slice(0, listLength - 1);

	return `${commaItems.join(', ')}${oxfordComma ? ',' : ''} and ${list[listLength - 1]}`;
}
