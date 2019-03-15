import { IMAGE_SIZES, IMAGE_CLASS, LOADED_CLASS } from 'scripts/modules/responsive-images/settings';
import { IImageManagerImage, IImageManagerTarget, ResponsiveImageType } from 'scripts/modules/responsive-images/models';

const regex = new RegExp(`-${IMAGE_SIZES.join('-|-')}-`, 'g');
const pixelDensity = window.devicePixelRatio;
const images = {};

export function addImage(
	url: string,
	element: HTMLElement,
	imageClass: string,
	loadedClass: string,
	type: ResponsiveImageType,
	minimumSize?: number,
	availableSizes: number[] = []
): void {
	if (!images[url]) {
		const urlSizeMatch = url.match(regex);

		images[url] = <IImageManagerImage>{
			sizeLoading: 0,
			targets: [],
			maxSizeAvailable: urlSizeMatch ? parseInt(urlSizeMatch[0].replace(/-/g, ''), 10) : null,
			minimumSize,
			availableSizes,
		};
	}

	imageClass = imageClass || element.getAttribute('data-image-class') || IMAGE_CLASS;
	loadedClass = loadedClass || element.getAttribute('data-loaded-class') || LOADED_CLASS;

	const target: IImageManagerTarget = {
		element,
		type,
		imageClass,
		loadedClass,
	};

	if (!images[url].targets.includes(target)) {
		images[url].targets.push(target);
	}
}
export function loadImage(url: string, width: number): void {
	const image: IImageManagerImage = images[url];

	let size = 1;

	if (image.maxSizeAvailable) {
		size = getClosestSize(width, image.maxSizeAvailable, image.availableSizes, image.minimumSize);
	}

	if (size > image.sizeLoading) {
		if (!image.request) {
			image.request = new Image();
		}
		const newUrl = url.replace(regex, `-${size}-`);
		image.sizeLoading = size;
		image.request.onload = () => handleImageLoaded(url, newUrl);
		image.request.src = newUrl;
	}
}

function handleImageLoaded(url: string, newUrl: string): void {
	const targets = images[url].targets;

	targets.forEach((t: IImageManagerTarget) => {
		if (t.type === ResponsiveImageType.Image) {
			handleImageTarget(newUrl, t);
		} else {
			handleBackgroundTarget(newUrl, t);
		}
	});
}

function handleImageTarget(url: string, target: IImageManagerTarget): void {
	let image = <HTMLImageElement>target.element.querySelector(`.${target.imageClass}`);
	if (!image) {
		image = document.createElement('img');
		image.className = target.imageClass;

		const alt = target.element.getAttribute('data-alt');

		if (!!alt) {
			image.alt = alt;
		}

		target.element.appendChild(image);
		setTimeout(() => image.classList.add(target.loadedClass), 20);
	}

	image.src = url;
	setTimeout(() => target.element.classList.add(target.loadedClass), 10);
}

function handleBackgroundTarget(url: string, target: IImageManagerTarget): void {
	target.element.style.backgroundImage = `url(${url})`;
	setTimeout(() => target.element.classList.add(target.loadedClass), 10);
}

function getClosestSize(requestedSize: number, maxSize: number, availableSizes: number[], minSize?: number): number {
	let size = null;

	if (pixelDensity && pixelDensity > 1) {
		requestedSize *= pixelDensity;
	}

	if (!availableSizes.length) {
		availableSizes = IMAGE_SIZES;
	}

	availableSizes.forEach((s: number) => {
		if (size === null || ((!minSize || s >= minSize) && s <= maxSize && Math.abs(s - requestedSize) < Math.abs(size - requestedSize))) {
			size = s;
		}
	});

	return size;
}
