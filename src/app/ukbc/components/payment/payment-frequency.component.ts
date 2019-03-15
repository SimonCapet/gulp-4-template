import { Component, Input, Output, OnInit, OnDestroy, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { IGeneralContent } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';
import { ContentService } from 'ukbc/services/content.service';

@Component({
	selector: 'ukbc-payment-frequency',
	templateUrl: './payment-frequency.component.html',
	styleUrls: ['./payment-frequency.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PaymentFrequencyComponent implements OnInit, OnDestroy {
	@Input() content: IGeneralContent;
	@Input() isOpen: boolean;
	@Input() isComplete: boolean;
	@Output() onFocus = new EventEmitter<FocusEvent>();

	private paymentContentSubscription: Subscription;

	public Content$: Observable<IGeneralContent>;
	public Content: IGeneralContent;

	constructor(private store: Store<fromRoot.State>, public contentService: ContentService) {
		this.Content$ = store.select(fromRoot.getGeneralContent);
	}

	ngOnInit() {
		this.paymentContentSubscription = this.Content$.subscribe(content => {
			this.Content = content;
		});
	}

	ngOnDestroy() {
		this.paymentContentSubscription.unsubscribe();
	}
}
