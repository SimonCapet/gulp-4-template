export interface IImageManagerImage {
	sizeLoading: number;
	targets: IImageManagerTarget[];
	request?: HTMLImageElement;
	maxSizeAvailable: number;
	minimumSize?: number;
	availableSizes?: number[];
}

export interface IImageManagerTarget {
	element: HTMLElement;
	type: ResponsiveImageType;
	imageClass: string;
	loadedClass: string;
}

export enum ResponsiveImageType {
	Image = 'image',
	Background = 'bg',
}
