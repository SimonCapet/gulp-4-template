export function getAllSiblings(elem, filter): HTMLElement[] {
	const sibs = [];
	elem = elem.parentNode.firstChild;
	do {
		if (elem.nodeType === 3) {
			continue;
		}
		if (!filter || filter(elem)) {
			sibs.push(elem);
		}
	} while ((elem = elem.nextSibling));
	return sibs;
}
