import * as BLazy from 'blazy';

export default class BLazyComponent {
	private options = {
		selector: '[data-component="blazy"]',
		breakpoints: [
			{
				width: 420,
				src: 'data-src-small',
			},
		],
	};
	private blazyObject: {};

	constructor(private context: HTMLElement) {
		this.blazyObject = new BLazy(this.options);
	}
}
