import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import * as fromRoot from 'ukbc/reducers';
import { IDialog } from 'ukbc/models';

@Component({
	selector: 'ukbc-dialogs',
	templateUrl: './dialogs.component.html',
})
export class DialogsComponent implements OnInit, OnDestroy {
	private subscriptions: Subscription[] = [];
	public Dialogs: IDialog[];

	constructor(private store: Store<fromRoot.State>) {}

	public ngOnInit(): void {
		this.subscriptions.push(this.store.select(fromRoot.getDialogs).subscribe(d => (this.Dialogs = d)));
	}

	public ngOnDestroy(): void {
		this.subscriptions.forEach(s => s.unsubscribe());
	}
}
