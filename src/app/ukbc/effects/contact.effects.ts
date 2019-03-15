import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from 'ukbc/reducers';
import { SET_CONTACTS, CompleteCard, OpenCard } from 'ukbc/actions';
import { EDetailsCardType } from 'ukbc/enums';
import { COMPLETE_CONTACT } from 'ukbc/actions/contact.actions';

@Injectable()
export class ContactEffects {
	constructor(private actions$: Actions, private store$: Store<fromRoot.State>) {}

	@Effect()
	contacts$: Observable<Action> = this.actions$
		.ofType(SET_CONTACTS, COMPLETE_CONTACT)
		.withLatestFrom(this.store$)
		.map(([action, state]) => {
			return { action, state };
		})
		.switchMap(({ action, state }) => {
			const actions = [];

			const contactsCompleted = state.contacts.completedContacts.length === state.contacts.contacts.length;

			if (contactsCompleted) {
				actions.push(new CompleteCard(EDetailsCardType.Members));
			}

			if (contactsCompleted && state.address.isValid) {
				actions.push(new CompleteCard(EDetailsCardType.Address));
			}

			if (action.type === SET_CONTACTS && state.contacts.completedContacts.length < state.contacts.contacts.length) {
				actions.push(new OpenCard(EDetailsCardType.Members));
			}

			return actions;
		});
}
