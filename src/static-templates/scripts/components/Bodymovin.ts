import { GetViewportDetails, IViewportDetails } from 'viewport-details';
import { AddTick } from 'tick-manager';

const bodymovin = require('../../../../node_modules/bodymovin/build/player/bodymovin.min.js');
const MOBILE_MAX_WIDTH = 1023;

export default class BodymovinComponent {
	private animation: {};
	private JSONUrlDesktop: string;
	private JSONUrlMobile: string;
	private viewport: IViewportDetails;
	private animationDiv: HTMLDivElement;
	private desktopAnimationUsed: boolean;

	constructor(private context: HTMLElement) {
		this.viewport = GetViewportDetails();
		this.JSONUrlDesktop = context.dataset.jsonUrlDesktop;
		this.JSONUrlMobile = context.dataset.jsonUrlMobile;
		this.animationDiv = <HTMLDivElement>document.querySelector('.BMAnimation');

		// Binding functions to the next animation frame
		AddTick(this.tick.bind(this));

		// Initialiasing the desktopAnimationUsed that will be used in updateAnimation()
		if (this.viewport.width <= MOBILE_MAX_WIDTH) {
			this.desktopAnimationUsed = true;
		} else {
			this.desktopAnimationUsed = false;
		}
		this.updateAnimation();
	}

	private tick(): void {
		this.viewport = GetViewportDetails();
		if (this.viewport.resized) {
			this.updateAnimation();
		}
	}

	/**
	 * Initialises the bodymovin plugin with the passed JSON object.
	 * @param JSONObject:{} JSON that contains the bodymovin animation.
	 */
	private loadAnimation(JSONObject: {}): void {
		this.animation = bodymovin.loadAnimation({
			container: this.animationDiv,
			renderer: 'svg',
			loop: true,
			autoplay: true,
			path: JSONObject,
		});
	}

	/**
	 * Updates the JSON file that bodymovin uses when the viewport moves
	 * from desktop to mobile and vice versa.
	 */
	private updateAnimation(): void {
		if (this.viewport.width > MOBILE_MAX_WIDTH && !this.desktopAnimationUsed) {
			this.animationDiv.innerHTML = '';
			this.loadAnimation(this.JSONUrlDesktop);
			this.desktopAnimationUsed = true;
		}
		if (this.viewport.width <= MOBILE_MAX_WIDTH && this.desktopAnimationUsed) {
			this.animationDiv.innerHTML = '';
			this.loadAnimation(this.JSONUrlMobile);
			this.desktopAnimationUsed = false;
		}
	}
}
