import { Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStep, IGeneralContent, IJourneyContent, IEagleEyeState } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';
import { VerifyEagleEyeTokenAction, SetEagleEyeTokenAction, SetShowValidationErrors } from 'ukbc/actions';
import { EagleEyeService } from 'ukbc/services/eagle-eye.service';
import { getFirstErrorMessage } from 'shared/services';

@Component({
	selector: 'ukbc-eagle-eye-header',
	templateUrl: './eagle-eye-header.component.html',
	styleUrls: ['./eagle-eye-header.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class EagleEyeHeaderComponent {
	public GeneralContent$: Observable<IGeneralContent>;
	public JourneyContent$: Observable<IJourneyContent>;
	public EagleEyeState$: Observable<IEagleEyeState>;
	public ForceShowValidationErrors$: Observable<boolean>;

	constructor(public ElementRef: ElementRef, private store: Store<fromRoot.State>, private eagleEyeService: EagleEyeService) {
		this.GeneralContent$ = store.select(fromRoot.getGeneralContent);
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
		this.EagleEyeState$ = store.select(fromRoot.getEagleEyeState);
		this.ForceShowValidationErrors$ = store.select(fromRoot.getForceShowValidationErrors);
	}

	public SetToken(token: string) {
		this.store.dispatch(new SetEagleEyeTokenAction(token));
	}

	public OnKeyUp($event: KeyboardEvent): void {
		if ($event.key === 'Enter') {
			this.SetToken((<HTMLInputElement>$event.target).value);
			this.ActivateToken();
		}
	}

	public ActivateToken() {
		this.EagleEyeState$.take(1).subscribe(({ token }: IEagleEyeState) => {
			if (token.isValid) {
				this.store.dispatch(new SetShowValidationErrors(false));
				this.eagleEyeService.VerifyToken(token.model);
			} else {
				this.eagleEyeService.ShowEagleEyeValidationError(getFirstErrorMessage(token.validationErrors.value));
			}
		});
	}
}
