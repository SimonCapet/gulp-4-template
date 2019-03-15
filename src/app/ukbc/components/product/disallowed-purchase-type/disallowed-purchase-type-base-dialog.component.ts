import { Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { IProduct } from 'app/ukbc/models/index';
import * as fromRoot from 'app/ukbc/reducers/index';
import * as dialogActions from 'ukbc/actions/dialog.actions';

export class DisallowedPurchaseTypeBaseDialogComponent {
	@Input() product: IProduct;

	public constructor(protected store: Store<fromRoot.State>, private dialogId: string) {}

	public ConfirmSelection(): void {
		throw new Error('Not implemented');
	}

	public CloseDialog(): void {
		this.store.dispatch(new dialogActions.CloseDialogAction(this.dialogId));
	}

	public get Description(): string {
		throw new Error('Not implemented');
	}

	public get ConfirmationButtonText(): string {
		throw new Error('Not implemented');
	}

	public get CancelButtonText(): string {
		throw new Error('Not implemented');
	}
}
