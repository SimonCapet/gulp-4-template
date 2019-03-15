import { Component, OnInit } from '@angular/core';
import * as cardActions from 'ukbc/actions/card.actions';
import * as fromRoot from 'ukbc/reducers';
import { Store } from '@ngrx/store';

@Component({
	selector: 'ukbc-details-payment',
	templateUrl: './details-payment.component.html',
	styleUrls: ['./details-payment.component.scss'],
})
export class DetailsPaymentComponent implements OnInit {
	constructor(private store: Store<fromRoot.State>) {}

	ngOnInit(): void {
		this.store.dispatch(new cardActions.OpenFirstUncompletedCard());
	}
}
