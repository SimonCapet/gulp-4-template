import { AfterViewInit, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AddTick } from 'tick-manager';
import { GetViewportDetails, IViewportDetails } from 'viewport-details';
import { ScrollTo } from 'scroll-to-position';
import { CONFIG } from 'ukbc/config';
import { ScrollIntoView } from 'scripts/modules';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
const scrollToElement = require('scroll-to-element');

@Injectable()
export class ViewportService {
	private viewportDetailsObserver: any;
	private scrollOffset: number;
	private racHeaderPresent: boolean;
	private racHeaderHeight: number;
	private eagleEyeHeaderPresent: boolean;
	private eagleEyeHeaderHeight: number;

	public ViewportDetails: Observable<IViewportDetails>;

	constructor(store: Store<fromRoot.State>) {
		const viewportDetailsObservable = Observable.create(observer => {
			this.viewportDetailsObserver = observer;
			AddTick(this.tick.bind(this));
		});

		this.ViewportDetails = viewportDetailsObservable.share();

		store.select(fromRoot.getScrollOffset).subscribe(offset => (this.scrollOffset = offset));
	}

	private tick() {
		const viewportDetails = GetViewportDetails();

		if (viewportDetails.changed) {
			this.viewportDetailsObserver.next(viewportDetails);
		}
	}

	public setRacHeaderPresent(isPresent: boolean, headerHeight: number) {
		this.racHeaderPresent = isPresent;
		this.racHeaderHeight = headerHeight;
	}

	public setEagleEyeHeaderPresent(isPresent: boolean, headerHeight: number) {
		this.eagleEyeHeaderPresent = isPresent;
		this.eagleEyeHeaderHeight = headerHeight;
	}

	public ScrollToElement(element: HTMLElement, animate: boolean = true, duration: number = 750, offset = 0): void {
		if (this.racHeaderPresent) {
			// Removing the RAC header height from the offset,
			// because the header is fixed and shouldn't be part of the offset calculation
			offset = offset - this.racHeaderHeight;
		}
		if (this.eagleEyeHeaderPresent) {
			// Adding the EagleEye header height to the offset,
			// because pages with this header have an added padding-top equal to this header's height
			offset = offset + this.eagleEyeHeaderHeight;
		}
		scrollToElement(element, {
			offset: offset,
			ease: 'linear',
			duration: animate ? duration : 0,
		});
	}

	public ScrollElementIntoView(element: HTMLElement) {
		setTimeout(() => {
			ScrollIntoView(element, window, this.scrollOffset);
		}, 150);
	}

	public ScrollFirstValidationErrorIntoView(): void {
		const validationError = <HTMLElement>document.querySelector('.js-invalid-input');
		if (validationError) {
			this.ScrollElementIntoView(validationError);
		}
	}

	public IsElementCompletelyInView(element: HTMLElement) {
		const { top, bottom } = element.getBoundingClientRect();
		return top >= 0 && bottom <= window.innerHeight;
	}

	public get DesktopMode(): boolean {
		const viewport = GetViewportDetails();
		return viewport.width > CONFIG.MOBILE_BREAKPOINT;
	}
}
