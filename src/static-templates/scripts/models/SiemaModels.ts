export interface ISiema {
	currentSlide: number;
	perPage: number;

	next(index?: number, callback?: () => void): void;
	prev(index?: number, callback?: () => void): void;
	goTo(index: number, callback?: () => void): void;
	remove(index: number, callback?: () => void): void;
	insert(item: HTMLElement, index: number, callback?: () => void): void;
	prepend(item: HTMLElement, callback?: () => void): void;
	append(item: HTMLElement, callback?: () => void): void;
	destroy(restoreMarkup?: boolean, callback?: () => void): void;
}

export interface IPageInterface {
	[key: number]: number;
}

export interface ISiemaOptions {
	selector?: string | HTMLElement;
	duration?: number;
	easing?: string;
	perPage?: number | IPageInterface;
	startIndex?: number;
	draggable?: boolean;
	multipleDrag?: boolean;
	threshold?: number;
	loop?: boolean;
	onInit?(): void;
	onChange?(): void;
}
