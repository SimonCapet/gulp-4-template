import { Component, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import classNames from 'classnames';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { ISelectOption, IValidationError } from 'shared/models';
import { AnalyticsService } from 'shared/services';

@Component({
	selector: 'app-input-select',
	templateUrl: './select.component.html',
})
export class InputSelectComponent {
	@Input() title: string;
	@Input() value: string;
	@Input() options: ISelectOption[];
	@Input() model: any;
	@Input() disabled: boolean;
	@Input() fixed: boolean;
	@Input() suffix: string;
	@Input() validationErrors?: IValidationError[];
	@Input() forceShowValidationErrors?: boolean;
	@Input() trackingFieldName: string;
	@Input() hideErrorMessage = false;

	@Output() onChange = new EventEmitter<any>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onBlur = new EventEmitter<{ $event: FocusEvent; model: any }>();

	private focused = false;
	private hasBlurred = false;

	constructor(private analyticsService: AnalyticsService, private renderer: Renderer2) {}

	public SendValue(event) {
		const value = event.target.value;
		this.onChange.emit({ ...this.model, value });
	}

	public Focused($event: FocusEvent) {
		this.analyticsService.trackFormFieldFocused(this.trackingFieldName);
		this.focused = true;
		this.onFocus.emit($event);

		this.renderer.addClass(document.body, 'input-focused');
	}

	public Blurred($event: FocusEvent): void {
		this.focused = false;
		this.hasBlurred = true;
		if (this.ErrorMessage.length) {
			this.analyticsService.trackFormFieldError(this.trackingFieldName, this.ErrorMessage);
		}

		this.onBlur.emit({ $event, model: this.model });

		this.renderer.removeClass(document.body, 'input-focused');
	}

	get ShowValidationErrors(): boolean {
		return this.forceShowValidationErrors || this.hasBlurred;
	}

	get ErrorMessage(): string {
		return !this.hideErrorMessage && this.ShowValidationErrors && this.validationErrors && this.validationErrors.length
			? this.validationErrors[0].errors[0]
			: '';
	}

	get IsValid(): boolean {
		return !this.ShowValidationErrors || this.validationErrors == null || this.validationErrors.length === 0;
	}

	get Classes() {
		return classNames({
			'Input--fixed': this.fixed,
			'Input--filled': !!this.value,
			'Input--invalid': !this.IsValid && !this.focused,
			'Input--valid': this.value && this.IsValid && !this.focused,
			'Input--focused': !this.disabled && this.focused,
			'Input--disabled': this.disabled,
			'js-invalid-input': !this.IsValid,
		});
	}
}
