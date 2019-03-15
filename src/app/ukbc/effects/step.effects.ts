import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import { State } from 'ukbc/reducers';
import { Observable } from 'rxjs/Observable';
import * as stepActions from 'ukbc/actions/step.actions';
import * as loadingActions from 'ukbc/actions/loading.actions';
import { getNextStep } from 'ukbc/reducers';
import { IStep } from 'ukbc/models';
import { Router } from '@angular/router';
import { withLatestFrom, map, tap } from 'rxjs/operators';
import { EStepType } from 'ukbc/enums';
import { EnableFrequencyChangeAction } from 'ukbc/actions';

// This value should match the transition duration in loading-indicator.component.scss
const loadingIndicatorTransitionInDuration = 750;

@Injectable()
export class StepEffects {
	constructor(private actions$: Actions, private store$: Store<fromRoot.State>, private router: Router) {}

	@Effect()
	activeNextStep$: Observable<Action> = this.actions$
		.ofType(stepActions.ACTIVATE_NEXT_STEP)
		.withLatestFrom(this.store$.select(getNextStep), (action, nextStep) => nextStep)
		.filter(nextStep => nextStep != null)
		.switchMap((nextStep: IStep) => {
			if (nextStep.data.ShowLoadingIndicator && nextStep.data.LoadingIndicatorDurationMilliseconds) {
				setTimeout(
					() => this.router.navigate([nextStep.url], { queryParamsHandling: 'merge' }),
					Math.min(loadingIndicatorTransitionInDuration, nextStep.data.LoadingIndicatorDurationMilliseconds)
				);
				setTimeout(
					() => this.store$.dispatch(new loadingActions.HideLoadingIndicator()),
					nextStep.data.LoadingIndicatorDurationMilliseconds
				);
				return [new loadingActions.ShowLoadingIndicator({ title: nextStep.data.LoadingIndicatorTitle })];
			} else {
				this.router.navigate([nextStep.url], { queryParamsHandling: 'merge' });
				return [];
			}
		});

	@Effect({ dispatch: false })
	setStepCurrent$: Observable<{ currentStep: IStep }> = this.actions$.ofType(stepActions.SET_STEP_CURRENT).pipe(
		withLatestFrom(this.store$.select(fromRoot.getCurrentStep), (action, currentStep) => currentStep),
		map(currentStep => ({ currentStep })),
		tap(({ currentStep }) => {
			if (currentStep.type !== EStepType.DetailsAndPayment) {
				// SetTimeout is needed to prevent "ExpressionChangedAfterItHasBeenCheckedError"
				setTimeout(() => this.store$.dispatch(new EnableFrequencyChangeAction()));
			}
		})
	);
}
