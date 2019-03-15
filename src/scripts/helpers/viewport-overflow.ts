export function ViewportOverflow(viewport: HTMLElement | Window = window, content: HTMLElement = document.body): boolean {
	let viewportHeight;

	if (viewport === window) {
		viewportHeight = (<Window>viewport).innerHeight;
	} else {
		viewportHeight = (<HTMLElement>viewport).offsetHeight;
	}

	return content.offsetHeight > viewportHeight;
}
