import { GetViewportDetails } from 'viewport-details';
import { AddTick } from 'tick-manager';
import { ISiema, ISiemaOptions } from '../models/SiemaModels';

const Siema = require('siema');

const DESKTOP_WIDTH = 1024;

// Siema carousel options
const coverBundlesCarouselOptions: ISiemaOptions = {
	duration: 300,
	easing: 'ease-out',
	startIndex: 0,
	draggable: true,
	threshold: 20,
	loop: false,
};

export default class CoverBundlesCarousel {
	private carouselObj: ISiema;
	private carouselOptions: {};
	private carouselInitialised: boolean;
	private coverBundles: HTMLElement[];
	private prevArrow: HTMLButtonElement;
	private nextArrow: HTMLButtonElement;
	private dotNav: HTMLElement[];
	private dotNavActiveClass: string;

	constructor(private context: HTMLElement) {
		// Initializing object properties
		this.coverBundles = [].slice.call(document.querySelectorAll('.CoverBundle'));
		this.carouselOptions = {
			selector: this.context.querySelector('.CoverBundles__items'),
			onChange: () => {
				this.printActiveSlide();
				this.updateNav();
			},
			...coverBundlesCarouselOptions,
		};
		this.prevArrow = <HTMLButtonElement>document.querySelector('.CoverBundles__prev');
		this.nextArrow = <HTMLButtonElement>document.querySelector('.CoverBundles__next');
		this.dotNav = [].slice.call(document.querySelectorAll('.CoverBundles__dot'));
		this.dotNavActiveClass = 'CoverBundles__dot--active';

		// Adding event listeners
		this.prevArrow.addEventListener('click', () => this.carouselObj.prev(1, this.updateNav.bind(this)));
		this.nextArrow.addEventListener('click', () => this.carouselObj.next(1, this.updateNav.bind(this)));
		this.dotNav.forEach(dotNavItem => dotNavItem.addEventListener('click', this.goTo.bind(this)));

		AddTick(() => {
			const viewport = GetViewportDetails();

			if (viewport.resized) {
				this.init();
			}
		});

		this.init();
		document.body.addEventListener('touchstart', (e: Event) => {}); // fix for preventscrolling messing with events
	}

	/**
	 * Initializes or destroys the carousel based on the viewport width.
	 */
	private init(): void {
		const viewport = GetViewportDetails();

		if (this.coverBundles.length <= 1 && !this.carouselInitialised) {
			this.context.classList.add('CoverBundles__carousel--one');
			this.carouselInitialised = true;
		} else if (viewport.width < DESKTOP_WIDTH && !this.carouselInitialised) {
			this.carouselObj = new Siema(this.carouselOptions);
			this.printActiveSlide();
			this.updateNav();
			this.carouselInitialised = true;
			this.context.classList.add('CoverBundles__carousel--initialised');
		} else if (viewport.width >= DESKTOP_WIDTH && this.carouselInitialised) {
			this.carouselObj.destroy(true);
			this.carouselInitialised = false;
		} else if (viewport.width >= DESKTOP_WIDTH && !this.carouselInitialised) {
			this.context.classList.add('CoverBundles__carousel--initialised');
		}
	}

	/**
	 * Prints an active class on the current carousel slide.
	 */
	private printActiveSlide(): void {
		this.coverBundles.forEach((slide, i) => {
			i === this.carouselObj.currentSlide
				? this.coverBundles[i].classList.add('CoverBundle--active')
				: this.coverBundles[i].classList.remove('CoverBundle--active');
		});
	}

	/**
	 * Pagination functionality
	 * @param e: Event
	 */
	private goTo(e: Event): void {
		e.preventDefault();
		const elem = <HTMLElement>e.target;
		const goToPage = parseInt(elem.getAttribute('data-goto'), 10);
		this.carouselObj.goTo(goToPage);
	}

	private updateNav(): void {
		this.updateArrows();
		this.updateDots();
	}

	private updateDots(): void {
		this.dotNav.forEach(dotNavItem => dotNavItem.classList.remove(this.dotNavActiveClass));
		this.dotNav[this.carouselObj.currentSlide].classList.add(this.dotNavActiveClass);
	}

	private updateArrows(): void {
		this.prevArrow.removeAttribute('disabled');
		this.nextArrow.removeAttribute('disabled');
		switch (this.carouselObj.currentSlide) {
			case 0:
				this.prevArrow.disabled = true;
				break;
			case this.coverBundles.length - 1:
				this.nextArrow.disabled = true;
				break;
		}
	}
}
