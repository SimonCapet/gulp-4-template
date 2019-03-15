import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import * as fromRoot from 'ukbc/reducers';
import * as eagleEyeActions from 'ukbc/actions/eagle-eye.actions';
import * as pricingActions from 'ukbc/actions/pricing.actions';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class EagleEyeEffects {
	constructor(private actions: Actions, private store: Store<fromRoot.State>) {}

	@Effect()
	confirmProduct$: Observable<Action> = this.actions
		.ofType(eagleEyeActions.VERIFY_EAGLE_EYE_TOKEN)
		.pipe(withLatestFrom(this.store), map(([action]) => ({ action })), switchMap(() => [new pricingActions.GetPricesAction()]));
}
