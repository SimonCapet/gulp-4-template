export function setElementCssTransform(element: HTMLElement, transformValue: string): void {
	element.style.webkitTransform ? (element.style.webkitTransform = transformValue) : (element.style.transform = transformValue);
}
