import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy, Renderer2 } from '@angular/core';
import classNames from 'classnames';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/share';
import { capitalise } from 'scripts/utils';
import { IValidationError } from 'shared/models/validation.model';
import { AnalyticsService } from 'shared/services';

enum EDateField {
	Day = 'Day',
	Month = 'Month',
	Year = 'Year',
}

@Component({
	selector: 'app-input-date',
	templateUrl: './date.component.html',
	styleUrls: ['./date.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDateComponent implements OnInit {
	@Input() title: string;
	@Input() value: string;
	@Input() model: any;
	@Input() modelId: string;
	@Input() validationErrors?: IValidationError[];
	@Input() forceShowValidationErrors?: boolean;
	@Input() trackingFieldName: string;
	@Input() autocomplete: string;
	@Input() disabled: boolean;
	@Output() onChange = new EventEmitter<any>();
	@Output() onFocus = new EventEmitter<FocusEvent>();

	public EDateField = EDateField;
	public Day: string = null;
	public Month: string = null;
	public Year: string = null;
	public ShowPlaceholder = false;
	private fields = [EDateField.Day, EDateField.Month, EDateField.Year];
	private isDateEntered = false;
	private inFocus = [];
	private hasBlurred = false;
	private currentField: HTMLInputElement;

	@ViewChild('dayField') dayField: ElementRef;
	@ViewChild('monthField') monthField: ElementRef;
	@ViewChild('yearField') yearField: ElementRef;

	constructor(private analyticsService: AnalyticsService, private renderer: Renderer2) {}

	ngOnInit() {
		if (this.value) {
			const date = new Date(this.value);

			this.isDateEntered = true;
			this.Day = date
				.getDate()
				.toString()
				.padStart(2, '0');
			this.Month = (date.getMonth() + 1).toString().padStart(2, '0');
			this.Year = date.getFullYear().toString();
		} else {
			this.isDateEntered = false;
		}
	}

	public SetValue(field: EDateField, value: string, padStart?: boolean): void {
		const numericValue = value ? parseInt(value, 10) : null;
		const isNumericKey = !isNaN(numericValue);
		this.isDateEntered = false;

		if (padStart) {
			value = value.padStart(2, '0');
		}

		switch (field) {
			case EDateField.Day: {
				if (numericValue > 3) {
					value = value.padStart(2, '0');
				}

				if (isNumericKey && this.inFocus.length && value.length > 1) {
					setTimeout(() => this.monthField.nativeElement.focus(), 0);
				}

				if (value.length <= 2) {
					this.Day = value;
				}
				break;
			}
			case EDateField.Month: {
				if (numericValue > 1) {
					value = value.padStart(2, '0');
				}

				if (isNumericKey && this.inFocus.length && value.length > 1) {
					setTimeout(() => this.yearField.nativeElement.focus(), 0);
				}

				if (value.length <= 2) {
					this.Month = value;
				}
				break;
			}
			case EDateField.Year: {
				if (value.length <= 4) {
					this.Year = value;
				}
				break;
			}
		}

		const date = new Date(`${this.Year}-${this.Month}-${this.Day}T00:00:00Z`);

		if (date && !isNaN(date.valueOf())) {
			this.isDateEntered = true;
		}

		this.ShowPlaceholder = !!(this.Day || this.Month || this.Year);

		this.onChange.emit({ ...this.model, value: date });
	}

	public OnKeyDown(field: EDateField, $event: KeyboardEvent): void {
		this.handleDelete(field, $event);
		this.handleArrows(field, $event);
	}

	public OnKeyUp(field: EDateField, $event: KeyboardEvent): void {
		this.handleDelete(field, $event);

		if (!this.isNavigationKey($event)) {
			this.OnFieldChange(field, $event);
		}
	}

	private handleDelete(field: EDateField, $event: KeyboardEvent): void {
		const key = this.getKeyCode($event);

		if (key === 8 || key === 46) {
			const selectionStart = this.currentField.selectionStart;
			const highlighted = selectionStart !== this.currentField.selectionEnd;
			switch (field) {
				case EDateField.Day: {
					const fieldLength = this.Day.length;

					if (key === 46 && selectionStart === 2 && !highlighted) {
						this.monthField.nativeElement.focus();
						this.monthField.nativeElement.setSelectionRange(0, 0);
					}
					break;
				}
				case EDateField.Month: {
					const fieldLength = this.Month.length;

					if (key === 8 && !fieldLength && !highlighted) {
						this.dayField.nativeElement.focus();
					}

					if (key === 46 && selectionStart === 2 && !highlighted) {
						this.yearField.nativeElement.focus();
						this.yearField.nativeElement.setSelectionRange(0, 0);
					}
					break;
				}
				case EDateField.Year: {
					const fieldLength = this.Year.length;

					if (key === 8 && !fieldLength && !highlighted) {
						this.monthField.nativeElement.focus();
					}
					break;
				}
			}
		}
	}

	private handleArrows(field: EDateField, $event: KeyboardEvent): void {
		const key = this.getKeyCode($event);

		switch (key) {
			case 36:
			case 37:
			case 38: {
				if (this.currentField.selectionStart < 1) {
					if (field === EDateField.Month) {
						this.OnFocus(EDateField.Day, <any>$event, true);
					}

					if (field === EDateField.Year) {
						this.OnFocus(EDateField.Month, <any>$event, true);
					}
				}
				break;
			}
			case 35:
			case 39:
			case 40: {
				if (this.currentField.selectionStart >= 2) {
					if (field === EDateField.Day) {
						this.OnFocus(EDateField.Month, <any>$event, true);
						this.monthField.nativeElement.setSelectionRange(0, 0);
					}

					if (field === EDateField.Month) {
						this.OnFocus(EDateField.Year, <any>$event, true);
						this.yearField.nativeElement.setSelectionRange(0, 0);
					}
				}
				break;
			}
		}
	}

	private isNavigationKey($event: KeyboardEvent): boolean {
		const key = this.getKeyCode($event);
		return key >= 35 && key <= 40;
	}

	private getKeyCode($event: KeyboardEvent): number {
		return $event.keyCode || $event.charCode;
	}

	public OnFocus(field: EDateField, $event: FocusEvent, preventDefault?: boolean): void {
		this.analyticsService.trackFormFieldFocused(this.trackingFieldName + capitalise(field));
		this.ShowPlaceholder = true;

		if (!this.Day && (field === EDateField.Year || field === EDateField.Month)) {
			this.currentField = this.dayField.nativeElement;
			this.inFocus.push(EDateField.Day);
		} else if (!this.Month && field === EDateField.Year) {
			this.currentField = this.monthField.nativeElement;
			this.inFocus.push(EDateField.Month);
		} else {
			switch (field) {
				case EDateField.Day: {
					this.currentField = this.dayField.nativeElement;
					break;
				}
				case EDateField.Month: {
					this.currentField = this.monthField.nativeElement;
					break;
				}
				case EDateField.Year: {
					this.currentField = this.yearField.nativeElement;
					break;
				}
			}

			this.inFocus.push(field);
		}

		if (preventDefault) {
			$event.preventDefault();
		}

		this.currentField.focus();

		this.onFocus.emit($event);

		this.renderer.addClass(document.body, 'input-focused');
	}

	public OnBlur(field: EDateField, $event: FocusEvent): void {
		this.inFocus = this.inFocus.filter(focused => focused !== field);
		this.hasBlurred = this.inFocus.length === 0;

		let value = (<HTMLInputElement>$event.target).value;

		if (!!value.length) {
			if (parseInt(value, 10) === 0) {
				value = null;
			}

			this.SetValue(field, value, value !== null && field !== EDateField.Year);
		}

		if (!this.inFocus.length) {
			this.ShowPlaceholder = false;
		}

		if (this.ErrorMessage.length) {
			this.analyticsService.trackFormFieldError(this.trackingFieldName + capitalise(field), this.ErrorMessage);
		}

		this.renderer.removeClass(document.body, 'input-focused');
	}

	public OnFieldChange(field: EDateField, $event: Event) {
		const value = (<HTMLInputElement>$event.target).value;

		if (value.includes('/')) {
			const dateParts = value.split('/');

			dateParts.forEach((part, index) => {
				this.SetValue(this.fields[index], part);
			});

			this.dayField.nativeElement.value = this.Day;
			this.monthField.nativeElement.value = this.Month;
			this.yearField.nativeElement.value = this.Year;
		} else {
			const maxLength = field === EDateField.Year ? 4 : 2;

			if (value.length <= maxLength) {
				this.SetValue(field, value);
			} else {
				switch (field) {
					case EDateField.Day: {
						this.dayField.nativeElement.value = this.Day;
						this.monthField.nativeElement.focus();
						break;
					}
					case EDateField.Month: {
						this.monthField.nativeElement.value = this.Month;
						this.yearField.nativeElement.focus();
						break;
					}
					case EDateField.Year: {
						this.yearField.nativeElement.value = this.Year;
						break;
					}
				}
			}
		}
	}

	public get ShowValidationErrors(): boolean {
		return this.forceShowValidationErrors || this.hasBlurred;
	}

	public get ErrorMessage(): string {
		return this.ShowValidationErrors && this.validationErrors && this.validationErrors.length ? this.validationErrors[0].errors[0] : '';
	}

	public get IsValid(): boolean {
		return !this.ShowValidationErrors || this.validationErrors == null || this.validationErrors.length === 0;
	}

	public get Classes(): string {
		return classNames({
			'Input--filled': this.isDateEntered || (this.Day || this.Month || this.Year),
			'Input--valid': this.isDateEntered && this.IsValid && !this.inFocus.length,
			'Input--invalid': !this.IsValid && !this.inFocus.length,
			'Input--disabled Date--disabled': this.disabled,
			'Input--focused': !!this.inFocus.length,
			'js-invalid-input': !this.IsValid,
		});
	}

	public get TitleClass(): string {
		return classNames({
			'Input__title--inactive': !this.inFocus.length,
		});
	}
}
