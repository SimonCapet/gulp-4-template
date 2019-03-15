import { Component, Input, ViewEncapsulation } from '@angular/core';
import { IGeneralContent, IJourneyContent } from 'ukbc/models';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import { Observable } from 'rxjs/Observable';
import * as dialogActions from 'ukbc/actions/dialog.actions';

@Component({
	selector: 'ukbc-eagle-eye-invalid-dialog',
	templateUrl: './eagle-eye-invalid-dialog.component.html',
	styleUrls: ['./eagle-eye-invalid-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class EagleEyeInvalidDialogComponent {
	@Input() errorMessage: string;
	@Input() setOnClose: Function;

	public Content$: Observable<IJourneyContent>;

	constructor(private store: Store<fromRoot.State>) {
		this.Content$ = store.select(fromRoot.getJourneyContent);
	}

	public Close() {
		this.store.dispatch(new dialogActions.CloseDialogAction('eagle-eye-error'));
	}
}
