import { Component, ViewEncapsulation, Input } from '@angular/core';
import { IJourneyContent } from 'ukbc/models';
import { Observable } from 'rxjs/Observable';
import * as fromRoot from 'ukbc/reducers';
import { Store } from '@ngrx/store';

@Component({
	selector: 'ukbc-exchange-eagle-eye-tokens-dialog',
	templateUrl: './exchange-eagle-eye-tokens-dialog.component.html',
	styleUrls: ['./exchange-eagle-eye-tokens-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class ExchangeEagleEyeTokensDialogComponent {
	@Input() setOnClose: Function;

	public JourneyContent$: Observable<IJourneyContent>;

	constructor(private store: Store<fromRoot.State>) {
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
	}
}
