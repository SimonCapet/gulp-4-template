import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { SET_SHOW_VALIDATION_ERRORS, SetShowValidationErrors } from 'ukbc/actions';
import { ViewportService } from 'ukbc/services';

@Injectable()
export class ValidationEffects {
	constructor(private actions$: Actions, private viewportService: ViewportService) {}

	@Effect({ dispatch: false })
	forceShowValidationErrors$: Observable<Action> = this.actions$
		.ofType(SET_SHOW_VALIDATION_ERRORS)
		.filter((action: SetShowValidationErrors) => action.payload)
		// setTimeout to ensure the SetShowValidationErrors action has completed, and so validation errors have been shown
		.do(() => setTimeout(() => this.viewportService.ScrollFirstValidationErrorIntoView(), 0));
}
