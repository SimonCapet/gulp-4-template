import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IValidationError } from 'shared/models';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import { IGeneralContent } from 'ukbc/models';

@Component({
	selector: 'ukbc-instalment-date-picker',
	templateUrl: './instalment-date-picker.component.html',
	styleUrls: ['./instalment-date-picker.component.scss'],
})
export class InstalmentDatePickerComponent implements OnInit {
	@Input() label: string;
	@Input() options: Array<{ value: number; text: string }>;
	@Input() value?: number | string;
	@Input() model: any;
	@Input() validationErrors?: IValidationError[];
	@Input() forceShowValidationErrors: boolean;

	@Output() onChange = new EventEmitter<any>();

	public Content: IGeneralContent;

	private isFocused = false;
	private hasBlurred = false;

	constructor(private store: Store<fromRoot.State>) {}

	ngOnInit() {
		this.store
			.select(fromRoot.getGeneralContent)
			.take(1)
			.subscribe(content => (this.Content = content));
	}

	public OnFocus() {
		this.isFocused = true;
	}

	public OnBlur() {
		this.isFocused = false;
		this.hasBlurred = true;
	}

	public OnChange($event) {
		this.onChange.emit($event);
	}

	public get ValidationErrors() {
		return this.validationErrors || [];
	}

	public get ValidationError(): string {
		return this.isFocused || !this.hasBlurred || !this.validationErrors || !this.validationErrors.length
			? ''
			: this.validationErrors[0].errors[0];
	}
}
