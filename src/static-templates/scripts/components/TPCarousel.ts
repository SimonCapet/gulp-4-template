import { GetViewportDetails } from 'viewport-details';
import { AddTick } from 'tick-manager';
import { ISiema, ISiemaOptions } from '../models/SiemaModels';
const Siema = require('siema');

// Siema carousel options
const TPCarouselOptions: ISiemaOptions = {
	duration: 300,
	easing: 'ease-out',
	startIndex: 0,
	draggable: true,
	threshold: 20,
	loop: false,
};

export default class TPCarousel {
	private carouselObj: ISiema;
	private carouselOptions: {};
	private tpReviews: HTMLElement[];
	private prevArrow: HTMLButtonElement;
	private nextArrow: HTMLButtonElement;
	private dotNav: HTMLElement;
	private dotNavItems: HTMLElement[];
	private dotNavActiveClass: string;
	private previousActiveSlide: number;
	private carouselWrapper: HTMLElement;
	private carouselSlides: HTMLElement[];

	constructor(private context: HTMLElement) {
		this.tpReviews = [].slice.call(document.querySelectorAll('.TPReview'));
		this.carouselOptions = {
			selector: this.context,
			perPage: {
				769: 3,
			},
			onChange: () => {
				// Swiping as many slides as the perPage property
				const swipeRemainder = this.carouselObj.currentSlide % this.carouselObj.perPage;
				if (swipeRemainder !== 0) {
					// On next slide swipe, go next() to as many slides as the remainder
					if (this.previousActiveSlide < this.carouselObj.currentSlide) {
						this.carouselObj.next(swipeRemainder);
					} else {
						this.carouselObj.prev(swipeRemainder);
					}
				} else {
					this.updateNav();
					this.previousActiveSlide = this.carouselObj.currentSlide;
				}
			},
			...TPCarouselOptions,
		};
		this.prevArrow = <HTMLButtonElement>document.querySelector('.TPCarousel__arrow--left');
		this.nextArrow = <HTMLButtonElement>document.querySelector('.TPCarousel__arrow--right');
		this.dotNav = <HTMLElement>document.querySelector('.TPCarousel__dots');
		this.dotNavActiveClass = 'TPCarousel__dot--active';

		// Adding event listeners
		this.prevArrow.addEventListener('click', () => this.carouselObj.prev(this.carouselObj.perPage, this.updateNav.bind(this)));
		this.nextArrow.addEventListener('click', () => this.carouselObj.next(this.carouselObj.perPage, this.updateNav.bind(this)));

		// Initialiase the carousel only when there are 2+ carousel items
		if (this.tpReviews.length > 1) {
			this.carouselObj = new Siema(this.carouselOptions);
			this.previousActiveSlide = 0;
			AddTick(() => {
				const viewport = GetViewportDetails();

				if (viewport.resized || viewport.orientationChanged) {
					this.carouselObj.goTo(0);
					this.updateNav();
					this.updateSlides();
				}
			});

			this.updateNav();
			this.updateSlides();
		}

		document.body.addEventListener('touchstart', (e: Event) => {}); // fix for preventscrolling messing with events
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

	/**
	 * Adds custom classes to the carousel track and slides.
	 * Currently relying on HTML structure as Siema doesn't provide
	 * configuration options for this.
	 */
	private updateSlides(): void {
		this.carouselWrapper = <HTMLElement>this.context.querySelector('div:first-of-type');
		this.carouselSlides = [].slice.call(this.carouselWrapper.querySelectorAll(':scope > div'));
		this.carouselWrapper.classList.add('TPCarousel__track');
		this.carouselSlides.forEach(carouselSlide => carouselSlide.classList.add('TPCarousel__slide'));
	}

	private updateNav(): void {
		this.updateArrows();
		this.updateDots();
	}

	private updateDots(): void {
		const numberOfDots = this.tpReviews.length / this.carouselObj.perPage;
		let dotsHTML = '';
		for (let i = 0; i < numberOfDots; i++) {
			dotsHTML += `<button class="TPCarousel__dot" data-goto="${i * this.carouselObj.perPage}" type="button"></button>`;
		}
		this.dotNav.innerHTML = dotsHTML;

		this.dotNavItems = [].slice.call(document.querySelectorAll('.TPCarousel__dot'));
		this.dotNavItems.forEach(dotNavItem => dotNavItem.addEventListener('click', this.goTo.bind(this)));
		this.dotNavItems.forEach(dotNavItem => dotNavItem.classList.remove(this.dotNavActiveClass));
		this.dotNavItems[Math.abs(this.carouselObj.currentSlide / this.carouselObj.perPage)].classList.add(this.dotNavActiveClass);
	}

	private updateArrows(): void {
		this.prevArrow.removeAttribute('disabled');
		this.nextArrow.removeAttribute('disabled');
		switch (Math.abs(this.carouselObj.currentSlide)) {
			case 0:
				this.prevArrow.disabled = true;
				break;
			case this.tpReviews.length - this.carouselObj.perPage:
				this.nextArrow.disabled = true;
				break;
		}
	}
}
