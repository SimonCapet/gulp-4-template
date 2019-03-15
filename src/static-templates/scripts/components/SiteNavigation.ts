import { PreventScrolling, ReEnableScrolling } from 'prevent-scrolling';
import { ScrollTo } from 'scroll-to-position';
import { getAllSiblings } from '../../../scripts/utils';

export default class SiteNavigation {
	private header: HTMLElement;
	private mobileTrigger: HTMLElement;
	private navigation: HTMLElement;
	private listItems: HTMLElement[];
	private subLevelTriggers: HTMLElement[];
	private siteWrapper: HTMLElement;
	private openClassName: string;
	private viewportWidth: number;
	private mobileNavBreakpoint: number;

	constructor(elem: HTMLElement) {
		this.header = <HTMLElement>document.querySelector('.SiteHeader');
		this.mobileTrigger = <HTMLElement>document.querySelector('.SiteNavigation__toggle');
		this.navigation = <HTMLElement>this.header.querySelector('.SiteNavigation');
		this.listItems = [].slice.call(this.navigation.querySelectorAll('.SiteNavigation__item'));
		this.subLevelTriggers = [].slice.call(this.navigation.querySelectorAll('.SiteNavigation__sub-level-toggle'));
		this.siteWrapper = <HTMLElement>document.querySelector('.SiteWrapper');
		this.openClassName = 'SiteNavigation__item--open';
		this.mobileNavBreakpoint = 768;

		this.init();
	}

	private init(): void {
		window.addEventListener('resize', () => {
			const previousViewportWidth = this.viewportWidth;
			const openSubLevel = this.navigation.querySelector(`.${this.openClassName}`);
			this.setViewportWidth();

			if (
				previousViewportWidth < this.mobileNavBreakpoint &&
				this.viewportWidth >= this.mobileNavBreakpoint &&
				this.navigation.classList.contains('SiteNavigation--open')
			) {
				this.closeNavigation();
			}

			if (openSubLevel) {
				const subWrapper = <HTMLElement>openSubLevel.querySelector('.SiteNavigation__sub-wrapper');
				document.querySelector(`.${this.openClassName}`).classList.remove(this.openClassName);
				subWrapper.style.height = '';
			}
		});

		this.setViewportWidth();

		this.mobileTrigger.addEventListener('click', this.toggleNavigation.bind(this));

		this.listItems.forEach(listItem => {
			listItem.addEventListener('mouseover', this.openSubLevel.bind(this));
			listItem.addEventListener('touchstart', this.cancelNavigationIfNotOpen.bind(this));
			listItem.addEventListener('mouseout', this.closeSubLevel.bind(this));
		});

		this.subLevelTriggers.forEach(trigger => trigger.addEventListener('click', this.toggleSubLevel.bind(this)));
	}

	private toggleNavigation(): void {
		this.mobileTrigger.classList.contains('SiteNavigation__toggle--open') ? this.closeNavigation() : this.openNavigation();
	}

	private openNavigation(): void {
		this.mobileTrigger.classList.add('SiteNavigation__toggle--open');
		this.navigation.classList.add('SiteNavigation--open');
		this.siteWrapper.classList.add('SiteWrapper--navigation-open');
		PreventScrolling(this.navigation);
	}

	private closeNavigation(): void {
		this.mobileTrigger.classList.remove('SiteNavigation__toggle--open');
		this.navigation.classList.remove('SiteNavigation--open');
		this.siteWrapper.classList.remove('SiteWrapper--navigation-open');
		ReEnableScrolling();
	}

	private toggleSubLevel(event: Event): void {
		event.stopPropagation();

		const listItem = (<HTMLElement>event.target).parentElement;

		listItem.classList.contains(this.openClassName) ? this.closeSubLevel(event) : this.openSubLevel(event);
	}

	private openSubLevel(event: Event): void {
		const listItem = <HTMLElement>(<HTMLElement>event.target).closest('.SiteNavigation__item');
		const siblings = getAllSiblings(listItem, false);
		const subWrapper = <HTMLElement>listItem.querySelector('.SiteNavigation__sub-wrapper');
		const subWrapperInner = <HTMLElement>subWrapper.querySelector('.SiteNavigation__sub-wrapper-inner');

		if (this.viewportWidth >= this.mobileNavBreakpoint) {
			siblings.forEach(sibling => sibling.classList.remove(this.openClassName));
			listItem.classList.add(this.openClassName);
		} else if (this.viewportWidth < this.mobileNavBreakpoint && event.type !== 'mouseover') {
			siblings.forEach(sibling => {
				sibling.classList.remove(this.openClassName);
				const siblingSubWrapper = <HTMLElement>sibling.querySelector('.SiteNavigation__sub-wrapper');

				if (siblingSubWrapper) {
					siblingSubWrapper.style.height = '';
				}
			});
			listItem.classList.add(this.openClassName);
			subWrapper.style.height = `${subWrapperInner.offsetHeight}px`;
			setTimeout(() => ScrollTo(listItem, { scrollContainer: this.navigation }), 250);
		}
	}

	private closeSubLevel(event: Event): void {
		const listItem = <HTMLElement>document.querySelector(`.${this.openClassName}`);
		const mouseEvent: MouseEvent = <MouseEvent>event;
		const targetElement: Element = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);

		if (
			listItem &&
			targetElement &&
			(!targetElement.closest(`.${this.openClassName}`) ||
				targetElement.classList.contains('SiteNavigation__link') ||
				targetElement.classList.contains('SiteNavigation__sub-level-toggle'))
		) {
			const subWrapper = <HTMLElement>listItem.querySelector('.SiteNavigation__sub-wrapper');

			if (this.viewportWidth >= this.mobileNavBreakpoint) {
				document.querySelector(`.${this.openClassName}`).classList.remove(this.openClassName);
			} else if (this.viewportWidth < this.mobileNavBreakpoint && event.type !== 'mouseout') {
				document.querySelector(`.${this.openClassName}`).classList.remove(this.openClassName);
				subWrapper.style.height = '0';
			}
		}
	}

	private cancelNavigationIfNotOpen(): void {
		if (!(<HTMLElement>event.target).closest('.SiteNavigation__item').classList.contains(this.openClassName)) {
			event.preventDefault();
			this.openSubLevel(event);
		}
	}

	private setViewportWidth(): void {
		this.viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}
}
