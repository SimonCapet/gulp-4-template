import { EBaseProductPrefix } from 'ukbc/enums';

// Removes any [data-vbm/pbm-content] elements from the modal content and returns the updated string of markup
export function getProductRelatedContent(modalContent: string, basisType: EBaseProductPrefix): string {
	const tempElement = document.createElement('div');
	tempElement.innerHTML = modalContent;
	const unrelatedElements = [].slice.call(tempElement.querySelectorAll(`[data-${basisType.toLowerCase()}-content]`));
	unrelatedElements.forEach(elem => {
		elem.outerHTML = '';
	});
	return tempElement.innerHTML;
}
