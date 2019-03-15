import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/withLatestFrom';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import * as fromRoot from 'ukbc/reducers';
import * as errorActions from 'ukbc/actions/error.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Injectable()
export class ErrorEffects {
	constructor(
		private actions$: Actions,
		private store$: Store<fromRoot.State>,
		private checkoutAnalyticsService: CheckoutAnalyticsService
	) {}

	@Effect()
	product$: Observable<Action> = this.actions$
		.ofType(errorActions.SHOW_ERROR)
		.withLatestFrom(this.store$)
		.map(([action]) => ({ action }))
		.switchMap(({ action }) => {
			const hideCloseButton = (action as any).payload.hideCloseButton || false;
			const actions = [new dialogActions.OpenDialogAction({ id: 'error-message', hideCloseButton })];
			return actions;
		});
}
