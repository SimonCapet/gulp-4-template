import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { clearSessionStorage } from 'shared/helpers';

import * as fromRoot from 'ukbc/reducers';
import { IErrorState, IErrorContent } from 'ukbc/models';
import * as dialogActions from 'ukbc/actions/dialog.actions';

import { CheckoutAnalyticsService } from 'ukbc/services';

@Component({
	selector: 'ukbc-error',
	templateUrl: './error.component.html',
	styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit, OnDestroy {
	@Input() setOnClose: Function;

	private errorState$: Observable<IErrorState>;
	private errorContent$: Observable<IErrorContent>;
	private isRenewal: boolean;
	private renewalRedirectURL: string;
	private errorSubscription: Subscription;
	private ErrorState: IErrorState;

	constructor(private store: Store<fromRoot.State>, private checkoutAnalyticsService: CheckoutAnalyticsService) {
		this.errorState$ = this.store.select(fromRoot.getErrorState);
		this.errorContent$ = this.store.select(fromRoot.getErrorsContent);
	}

	ngOnInit() {
		this.errorSubscription = this.errorState$.subscribe(errorState => {
			this.ErrorState = errorState;
		});

		this.store
			.select(fromRoot.getIsRenewal)
			.take(1)
			.subscribe(isRenewal => (this.isRenewal = isRenewal));

		this.store
			.select(fromRoot.getJourneyContent)
			.take(1)
			.subscribe(content => (this.renewalRedirectURL = content.RenewalTimeoutRedirectURL));
	}

	ngOnDestroy() {
		this.errorSubscription.unsubscribe();
	}

	public get Error(): Observable<Object> {
		return this.errorState$.switchMap(errorState => {
			return this.errorContent$.map(errorContent => {
				const title = errorContent[errorState.error.errorCode + 'Title'];
				const description = errorContent[errorState.error.errorCode + 'Description'];
				const tryAgainButtonText = errorContent[errorState.error.errorCode + 'Button'] || errorContent['TryAgainMessage'];

				if (this.ErrorState.error.reload) {
					clearSessionStorage();
				}

				return {
					title: title ? title : '',
					description: description ? description : '',
					tryAgainButtonText,
				};
			});
		});
	}

	public TryAgain(): void {
		this.checkoutAnalyticsService.TrackEvent('UKBC_ErrorPopUpButtonClicked');
		if (this.ErrorState.error.reload) {
			if (this.isRenewal) {
				window.location.href = `${window.location.origin}${this.renewalRedirectURL}`;
			} else {
				window.location.reload();
			}
		} else if (this.ErrorState.error.action) {
			this.store.dispatch(this.ErrorState.error.action);
		}

		if (this.ErrorState.error.retryCallback) {
			this.ErrorState.error.retryCallback();
		}

		if (!this.ErrorState.error.reload) {
			this.store.dispatch(new dialogActions.CloseDialogAction('error-message'));
		}
	}
}
