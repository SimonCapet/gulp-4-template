export default class SiteRibbon {
	private header: HTMLElement;
	private scrolledClass: string;

	constructor(elem: HTMLElement) {
		this.header = <HTMLElement>document.querySelector('.SiteHeader');
		this.scrolledClass = 'SiteHeader--scrolled';

		this.init();
	}

	private init(): void {
		window.addEventListener('scroll', this.toggleRibbon.bind(this));
	}

	private toggleRibbon(): void {
		const scrollPosition = window.scrollY ? window.scrollY : window.pageYOffset;

		if (scrollPosition > 0) {
			this.hideRibbon();
		} else {
			this.showRibbon();
		}
	}

	private showRibbon(): void {
		this.header.classList.remove(this.scrolledClass);
	}

	private hideRibbon(): void {
		this.header.classList.add(this.scrolledClass);
	}
}
