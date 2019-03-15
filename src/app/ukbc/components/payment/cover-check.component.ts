import { Component, OnChanges, ChangeDetectionStrategy, Input, ElementRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from 'ukbc/reducers';
import * as layoutActions from 'ukbc/actions/layout.actions';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-cover-check',
	templateUrl: './cover-check.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverCheckComponent implements OnChanges, OnDestroy {
	@Input() content: string;

	private button: HTMLButtonElement;

	constructor(
		private store: Store<fromRoot.State>,
		private checkoutAnalyticsService: CheckoutAnalyticsService,
		private elementRef: ElementRef
	) {}

	ngOnChanges() {
		setTimeout(this.addTermsAndConditionsLinkListener.bind(this));
	}

	ngOnDestroy() {
		this.removeEventListener();
	}

	private addTermsAndConditionsLinkListener(): void {
		this.removeEventListener();

		this.button = <HTMLButtonElement>this.elementRef.nativeElement.querySelector('.js-terms');

		if (this.button) {
			this.button.addEventListener('click', this.handleTermsAndConditionsLinkClick.bind(this));
			this.button.className = `LinkBtn`;
		}
	}

	private removeEventListener(): void {
		if (this.button) {
			this.button.removeEventListener('click', this.handleTermsAndConditionsLinkClick.bind(this));
		}
	}

	private handleTermsAndConditionsLinkClick(event: Event): void {
		event.preventDefault();

		this.checkoutAnalyticsService.TrackTermsAndConditionsLinkClicked();
	}
}
