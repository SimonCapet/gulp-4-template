import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { State } from 'ukbc/reducers';
import {
	OPEN_FIRST_UNCOMPLETED_CARD,
	COMPLETE_CARD,
	OPEN_CARD,
	PreventFrequencyChangeAction,
	EnableFrequencyChangeAction,
} from 'ukbc/actions';
import { CheckoutAnalyticsService } from 'ukbc/services';
import { Observable } from 'rxjs/Observable';
import { withLatestFrom, map, tap } from 'rxjs/operators';
import { EPaymentCardType } from 'ukbc/enums';

@Injectable()
export class CardEffects {
	private previousCardCategory: string;

	constructor(private actions$: Actions, private store$: Store<State>, private analyticsService: CheckoutAnalyticsService) {}

	@Effect({ dispatch: false })
	cards$: Observable<{ action: Action; state: State }> = this.actions$.ofType(OPEN_FIRST_UNCOMPLETED_CARD, COMPLETE_CARD, OPEN_CARD).pipe(
		withLatestFrom(this.store$),
		map(([action, state]) => {
			return { action, state };
		}),
		tap(({ action, state }) => {
			switch (action.type) {
				case OPEN_FIRST_UNCOMPLETED_CARD:
				case COMPLETE_CARD:
				case OPEN_CARD: {
					const cardType = state.card.openCardType;
					const card = state.card.cards.find(c => c.type === cardType);
					// Adding page to end of tag is needed to differentiate event from previous version of journey (requested by Analytics team)
					const cardCategory = `${card.category.toLowerCase()}page`;

					if (cardCategory !== this.previousCardCategory) {
						this.analyticsService.TrackPageLoad(cardCategory, cardCategory);
					}

					// SetTimeout is needed to prevent "ExpressionChangedAfterItHasBeenCheckedError"
					setTimeout(() => {
						if (card.type === EPaymentCardType.CardPayment) {
							this.store$.dispatch(new PreventFrequencyChangeAction());
						} else {
							this.store$.dispatch(new EnableFrequencyChangeAction());
						}
					});

					this.previousCardCategory = cardCategory;
					break;
				}
			}
		})
	);
}
