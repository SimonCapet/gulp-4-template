import { ScrollTo } from 'scroll-to-position';
import { GetViewportDetails } from 'viewport-details';

const win = window;

export function ScrollIntoView(element: HTMLElement, scrollArea: HTMLElement | Window = win, offsetTop = 0, offsetBottom = 0): void {
	const elemRect = element.getBoundingClientRect();

	let scrollY: number;
	let scrollAreaTop = offsetTop;
	let scrollAreaHeight: number;

	if (scrollArea === win) {
		const viewport = GetViewportDetails();
		scrollY = viewport.scrollY;
		scrollAreaHeight = viewport.height;
	} else {
		const scrollAreaRect = (<HTMLElement>scrollArea).getBoundingClientRect();
		scrollY = (<HTMLElement>scrollArea).scrollTop;
		scrollAreaTop += scrollAreaRect.top;
		scrollAreaHeight = scrollAreaRect.height;
	}

	const viewportBottom = scrollAreaHeight - offsetBottom;

	let diff = 0;

	if (elemRect.top < scrollAreaTop) {
		diff = scrollAreaTop - elemRect.top;
	} else if (elemRect.bottom > viewportBottom) {
		diff = elemRect.bottom - viewportBottom;
	}

	if (elemRect.top - diff < scrollAreaTop) {
		diff += elemRect.top - diff - scrollAreaTop;
	}

	if (diff !== 0) {
		ScrollTo([0, scrollY + diff], { scrollContainer: scrollArea });
	}
}
