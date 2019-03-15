import { Component, Input, Output, OnInit, EventEmitter, Renderer2 } from '@angular/core';
import classNames from 'classnames';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { IValidationError } from 'shared/models/validation.model';
import { AnalyticsService } from 'shared/services';
@Component({
	selector: 'app-input-text',
	templateUrl: './text.component.html',
})
export class InputTextComponent implements OnInit {
	@Input() title: string;
	@Input() id?: string;
	@Input() value: string;
	@Input() type = 'text';
	@Input() min: string;
	@Input() max: string;
	@Input() step: string;
	@Input() pattern: string;
	@Input() maxLength: string;
	@Input() model: any;
	@Input() disabled: boolean;
	@Input() autocomplete;
	@Input() validationErrors?: IValidationError[];
	@Input() forceShowValidationErrors?: boolean;
	@Input() serverError?: boolean;
	@Input() trackingFieldName: string;
	@Input() inline?: boolean;
	@Input() hideErrorMessage?: boolean;
	@Input() hideValidIndicator?: boolean;
	@Input() dontAddInputFocusedClass?: boolean;

	@Output() onChange = new EventEmitter<any>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onBlur = new EventEmitter<{ $event: FocusEvent; model: any }>();
	@Output() onKeyUp = new EventEmitter<KeyboardEvent>();

	private focused = false;
	private hasBlurred = false;
	private lastPressedKey: string;
	private previousValue = this.value;

	constructor(private analyticsService: AnalyticsService, private renderer: Renderer2) {}

	ngOnInit(): void {
		if (!!this.value && (this.validationErrors !== null || this.validationErrors.length)) {
			this.hasBlurred = true;
		}
	}

	public SendValue($event: KeyboardEvent) {
		const key = $event.key;
		this.lastPressedKey = key;

		const allowedEditKeys = ['Backspace', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];

		if (this.type === 'number' && !$event.ctrlKey && !allowedEditKeys.includes(key) && isNaN(parseInt(key, 10))) {
			$event.preventDefault();
		}

		const value = (<HTMLInputElement>$event.target).value;

		this.onChange.emit({ $event, ...this.model, value });
	}

	public Focused($event: FocusEvent): void {
		this.analyticsService.trackFormFieldFocused(this.trackingFieldName);
		this.focused = true;
		this.onFocus.emit($event);

		if (!this.dontAddInputFocusedClass) {
			this.renderer.addClass(document.body, 'input-focused');
		}
	}

	public Blurred($event: FocusEvent): void {
		this.focused = false;
		this.hasBlurred = true;
		if (this.ErrorMessage.length) {
			this.analyticsService.trackFormFieldError(this.trackingFieldName, this.ErrorMessage);
		}

		if (!this.dontAddInputFocusedClass) {
			this.renderer.removeClass(document.body, 'input-focused');
		}

		this.onBlur.emit({ $event, model: this.model });
	}

	public OnWheel($event: Event): void {
		if (this.focused && this.type === 'number') {
			$event.preventDefault();
		}
	}

	public OnKeyUp($event: KeyboardEvent): void {
		this.onKeyUp.emit($event);

		this.SendValue($event);
	}

	public get ShowValidationErrors(): boolean {
		return this.forceShowValidationErrors || this.hasBlurred;
	}

	public get ErrorMessage(): string {
		return this.ShowValidationErrors && this.validationErrors && this.validationErrors.length && !this.hideErrorMessage
			? this.validationErrors[0].errors[0]
			: '';
	}

	public get IsValid(): boolean {
		return !this.ShowValidationErrors || this.validationErrors == null || this.validationErrors.length === 0;
	}

	private get valueSet(): boolean {
		return this.value !== '' && this.value !== null && typeof this.value !== 'undefined';
	}

	public get Classes(): string {
		return classNames({
			'Input--filled': this.valueSet,
			'Input--invalid': (!this.IsValid && !this.focused) || this.serverError,
			'Input--valid': this.valueSet && this.IsValid && !this.focused && !this.serverError,
			'Input--disabled': this.disabled,
			'Input--focused': !this.disabled && this.focused,
			'js-invalid-input': !this.IsValid,
			'Input--force-show-errors': this.lastPressedKey === 'Enter',
			'Input--inline': this.inline,
		});
	}
}
