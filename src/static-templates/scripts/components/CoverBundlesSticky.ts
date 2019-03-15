import { GetViewportDetails } from 'viewport-details';
import { AddTick } from 'tick-manager';

export default class CoverBundlesSticky {
	private coverBundlesCTA: HTMLAnchorElement;
	private coverBundlesSticky: HTMLDivElement;
	private stickyVisibleClass: string;
	private ctaHiddenClass: string;
	private coverBundlesCTAOffset: number;
	private DesktopWidth: number;

	/**
	 * CoverBundlesSticky constructor
	 * @param context - The HTMLElement with [data-component='cover-bundles']
	 */
	constructor(private context: HTMLElement) {
		// Initialising properties
		this.coverBundlesCTA = <HTMLAnchorElement>document.querySelector('.CoverBundles__cta .Btn');
		this.coverBundlesSticky = <HTMLDivElement>context;
		this.stickyVisibleClass = 'CoverBundles__sticky--visible';
		this.ctaHiddenClass = 'CoverBundles__Btn--hidden';
		this.DesktopWidth = 1024;

		// Binding functions to the next animation frame
		AddTick(this.tick.bind(this));

		// Updating the sticky CTA on load
		this.updateSticky();
	}

	private tick(): void {
		const viewportDetails = GetViewportDetails();
		if (viewportDetails.resized || viewportDetails.scrolled) {
			this.updateSticky();
		}
	}

	/**
	 * Shows/hides sticky CTA on mobile based on the window scrolling position
	 */
	private updateSticky(): void {
		const viewportDetails = GetViewportDetails();
		this.coverBundlesCTAOffset = this.coverBundlesCTA.offsetTop;
		if (viewportDetails.width > this.DesktopWidth || window.pageYOffset <= this.coverBundlesCTAOffset) {
			this.hideSticky();
		} else {
			this.showSticky();
		}
	}

	private hideSticky(): void {
		this.coverBundlesCTA.classList.remove(this.ctaHiddenClass);
		this.coverBundlesSticky.classList.remove(this.stickyVisibleClass);
	}

	private showSticky(): void {
		this.coverBundlesCTA.classList.add(this.ctaHiddenClass);
		this.coverBundlesSticky.classList.add(this.stickyVisibleClass);
	}
}
