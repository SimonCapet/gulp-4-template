import { GetViewportDetails } from 'viewport-details';
import { AddTick } from 'tick-manager';

export default class StickyMessage {
	private stickyMessage: HTMLElement;
	private siteWrapper: HTMLElement;
	private racHeader: HTMLElement;
	
	/**
	 * StickyMessage constructor
	 * @param context - The HTMLElement with [data-component='sticky-message']
	 */
	constructor(private context: HTMLElement) {
		this.stickyMessage = context;
		this.siteWrapper = <HTMLElement>document.querySelector('.SiteWrapper');
		this.racHeader = <HTMLElement>document.querySelector('header:first-of-type');

		// Binding functions to the next animation frame
		AddTick(this.tick.bind(this));

		this.updateSticky();
	}

	private tick(): void {
		const viewportDetails = GetViewportDetails();
		if (viewportDetails.resized) {
			this.updateSticky();
		}
	}

	/**
	 * Updates the position top of the sticky message according to the height of the RAC header.
	 * Updates the container of the sticky message with the appropriate padding-top.
	 */
	private updateSticky() {
		this.stickyMessage.style.top = `${this.racHeader.clientHeight}px`;
		this.siteWrapper.style.paddingTop = `${this.stickyMessage.clientHeight}px`;
	}
}
