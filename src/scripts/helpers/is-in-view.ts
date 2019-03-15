import { GetViewportDetails } from 'viewport-details';

export function IsInView(element: HTMLElement, threshold = 0): boolean {
	const rect = element.getBoundingClientRect();
	const viewHeight = GetViewportDetails().height;

	return rect.top - threshold <= viewHeight && rect.bottom + threshold >= 0 && getComputedStyle(element).display !== 'none';
}
