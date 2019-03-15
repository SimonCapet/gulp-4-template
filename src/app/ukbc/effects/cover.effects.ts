import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { withLatestFrom, map, switchMap } from 'rxjs/operators';

import * as fromRoot from 'ukbc/reducers';
import * as coverActions from 'ukbc/actions/cover.actions';
import { CoverService } from 'ukbc/services';

@Injectable()
export class CoverEffects {
	constructor(private actions$: Actions, private store$: Store<fromRoot.State>, private coverService: CoverService) {}

	@Effect()
	product$: Observable<Action> = this.actions$.ofType(coverActions.SAVE_COVER).pipe(
		withLatestFrom(this.store$),
		map(([action]) => ({ action })),
		switchMap(({ action }) => {
			const actions = [];

			switch (action.type) {
				case coverActions.SAVE_COVER: {
					const { source, openCard } = (<coverActions.SaveCoverAction>action).payload;

					this.coverService.SaveCover(source, openCard);
				}
			}

			return actions;
		})
	);
}
