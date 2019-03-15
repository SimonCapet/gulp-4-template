import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { select, Store } from '@ngrx/store';
import { IAPIURLs, IErrorContent } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';

import { HttpService } from 'shared/services';
import { IEagleEyeVerificationResponse, IEagleEyeToken } from 'ukbc/models/eagle-eye.model';
import { CreateDialogAction, VerifyEagleEyeTokenAction } from 'ukbc/actions';
import * as errorActions from 'ukbc/actions/error.actions';
import { EErrorCode } from 'ukbc/enums';
import { StartVerifyEagleEyeTokenAction } from 'ukbc/actions/eagle-eye.actions';
import { EagleEyeInvalidDialogComponent } from 'ukbc/components/eagle-eye/eagle-eye-invalid-dialog.component';
import { map, take } from 'rxjs/operators';

@Injectable()
export class EagleEyeService {
	private apiUrls: IAPIURLs;
	private errorContent: IErrorContent;

	constructor(private http: HttpClient, private store: Store<fromRoot.State>, private httpService: HttpService) {
		store.pipe(select(fromRoot.getAPIURLs), take(1), map(apiUrls => (this.apiUrls = apiUrls))).subscribe();
		store.pipe(select(fromRoot.getErrorsContent), take(1), map(errorContent => (this.errorContent = errorContent))).subscribe();
	}

	public VerifyToken(token: IEagleEyeToken): Promise<any> {
		this.store.dispatch(new StartVerifyEagleEyeTokenAction());
		const url = `${this.apiUrls.EagleEyeVerificationUrl}`;
		return this.httpService
			.get(url, `?voucherCode=${token.value}`, {}, true, this.errorContent.EagleEyeVerificationTimeout)
			.toPromise()
			.then((response: IEagleEyeVerificationResponse) => {
				this.store.dispatch(new VerifyEagleEyeTokenAction({ isValid: response.Success, value: response.Value }));
				if (!response.Success) {
					this.ShowEagleEyeValidationError(response.ErrorDescription);
				}
			})
			.catch(error => {
				if (!error.handled) {
					const errorCode = (error.name = 'TimeoutError' ? EErrorCode.VerifyEagleEyeTokenTimeout : EErrorCode.VerifyEagleEyeTokenFailed);
					this.store.dispatch(
						new errorActions.ShowErrorAction({
							errorCode,
							retryCallback: () => this.VerifyToken(token),
						})
					);
				}
			});
	}

	public ShowEagleEyeValidationError(errorMessage: string) {
		this.store.dispatch(
			new CreateDialogAction({
				id: 'eagle-eye-error',
				component: EagleEyeInvalidDialogComponent,
				componentInputs: { errorMessage },
				open: true,
			})
		);
	}
}
