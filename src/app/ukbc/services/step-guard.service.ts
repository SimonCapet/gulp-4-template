import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import { IStep } from 'ukbc/models';
import { getCurrentStep } from 'ukbc/reducers/step.reducer';

@Injectable()
export class StepGuard implements CanActivate {
	constructor(private store: Store<fromRoot.State>, private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot): Observable<boolean> {
		return this.store.select(fromRoot.getSteps).map((steps: IStep[]) => {
			const stepToOpenIndex = steps.findIndex(s => s.url === next.url.join(''));
			const stepToOpen = steps[stepToOpenIndex];
			const previousStep = steps[stepToOpenIndex - 1];
			const canNavigate =
				stepToOpen != null &&
				(stepToOpen.status.completed || stepToOpen.status.current || stepToOpenIndex === 0 || previousStep.status.completed);

			if (!canNavigate && getCurrentStep(steps) == null) {
				this.router.navigate(['/'], { queryParamsHandling: 'merge' });
			}
			return canNavigate;
		});
	}
}
