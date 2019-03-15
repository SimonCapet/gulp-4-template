import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { Store } from '@ngrx/store';

import * as fromRoot from 'ukbc/reducers';
import * as errorActions from 'ukbc/actions/error.actions';
import { EErrorCode } from 'ukbc/enums';
import { CheckoutAnalyticsService } from 'ukbc/services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
	constructor(private store: Store<fromRoot.State>, private checkoutAnalyticsService: CheckoutAnalyticsService) {}
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).catch(error => {
			const customError = { ...error };
			if (error instanceof HttpErrorResponse && error.error.UseServerError) {
				customError.handled = true;

				this.checkoutAnalyticsService.TrackServerError('session expired');

				const action = new errorActions.ShowErrorAction({
					errorCode: EErrorCode.SessionExpiry,
					hideCloseButton: true,
					reload: true,
				});
				this.store.dispatch(action);
			}

			return Observable.throw(customError);
		});
	}
}
