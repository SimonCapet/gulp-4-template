import { GetViewportDetails } from 'viewport-details';
import { IsInView } from 'scripts/helpers/is-in-view';
import { AddTick } from 'tick-manager';

import { addImage, loadImage } from 'scripts/modules/responsive-images/image-manager';
import { ResponsiveImageType } from 'scripts/modules/responsive-images/models';
import { IN_VIEW_THRESHOLD } from 'scripts/modules/responsive-images/settings';
import { sortBy } from 'sort-by-typescript';

export class ResponsiveImage {
	private context: HTMLElement;
	private type: ResponsiveImageType;
	private url: string;
	private width: number;
	private previousWidth: number;
	private resized = false;

	constructor(context: HTMLElement, url?: string, imageClass?: string, loadedClass?: string, type?: ResponsiveImageType) {
		this.context = context;

		const dataImg = context.getAttribute('data-img');
		const dataImgs = context.getAttribute('data-imgs');
		const dataAvailableSizes = context.getAttribute('data-available-sizes');

		let availableSizes: number[];

		if (url) {
			this.url = url;
		} else if (dataImg) {
			this.url = dataImg;
		} else if (dataImgs) {
			const images = dataImgs
				.split(',')
				.map(img => {
					return {
						url: img,
						size: parseInt(img.match(/(-[0-9]{2,5}-)/)[0].replace(/(-)/g, ''), 10),
					};
				})
				.sort(sortBy('-size'));

			this.url = images[0].url;

			availableSizes = images.map(img => img.size);
		}

		if (!availableSizes && dataAvailableSizes) {
			availableSizes = dataAvailableSizes.split(',').map(size => parseInt(size, 10));
		}

		this.type = type || <ResponsiveImageType>context.getAttribute('data-img-type') || ResponsiveImageType.Image;
		const minimumSize = Number(context.getAttribute('data-min-size'));

		this.width = context.offsetWidth;

		this.previousWidth = this.width;

		addImage(this.url, context, imageClass, loadedClass, this.type, minimumSize, availableSizes);
		this.checkIfVisibleInViewport();
		AddTick(this.tick.bind(this));
	}

	private tick(): void {
		this.width = this.context.offsetWidth;
		this.resized = this.width !== this.previousWidth;

		this.previousWidth = this.width;

		if (this.resized || GetViewportDetails().scrolled) {
			this.checkIfVisibleInViewport();
		}
	}

	private checkIfVisibleInViewport(): void {
		if (IsInView(this.context, IN_VIEW_THRESHOLD)) {
			loadImage(this.url, this.width);
		}
	}

	public TriggerLoad(): void {
		loadImage(this.url, this.width);
	}
}
