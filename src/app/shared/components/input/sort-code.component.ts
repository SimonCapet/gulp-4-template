import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import classNames from 'classnames';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/share';
import { IValidationError } from 'shared/models/validation.model';
import { AnalyticsService } from 'shared/services';
@Component({
	selector: 'ukbc-sort-code',
	templateUrl: './sort-code.component.html',
	styleUrls: ['./sort-code.component.scss'],
})
export class InputSortCodeComponent implements OnInit {
	@Input() title: string;
	@Input() value: string;
	@Input() model: any;
	@Input() modelId: string;
	@Input() validationErrors?: IValidationError[];
	@Input() forceShowValidationErrors?: boolean;
	@Input() serverError?: boolean;
	@Input() trackingFieldName: string;
	@Output() onChange = new EventEmitter<any>();
	sortCode: string[] = ['', '', ''];
	showPlaceholder = false;
	inFocus = [];
	private hasBlurred = false;
	isSortCodeEntered = false;
	isValidSortCode = false;
	@ViewChild('inputOne') inputOne: ElementRef;
	@ViewChild('inputTwo') inputTwo: ElementRef;
	@ViewChild('inputThree') inputThree: ElementRef;

	public ComponentId: string;

	constructor(private cd: ChangeDetectorRef, private analyticsService: AnalyticsService, private renderer: Renderer2) {}

	ngOnInit() {
		// Do not init if validation for this field exists -- component is being re-rendered
		const sortCode = this.value;
		this.isSortCodeEntered = sortCode && !isNaN(parseInt(sortCode, 10));
		if (this.isSortCodeEntered && (this.validationErrors == null || this.validationErrors.length === 0)) {
			this.sortCode = [sortCode.substring(0, 2), sortCode.substring(2, 4), sortCode.substring(4, 6)];
			this.hasBlurred = true;
		}
	}

	public SetValue(field, $event, padValue = false) {
		const value = $event;
		const numericKey = !isNaN(parseInt(value, 10));
		this.isSortCodeEntered = false;

		switch (field) {
			case 0:
				if (numericKey && value.toString().length > 1) {
					this.inputTwo.nativeElement.focus();
				}
				this.sortCode[0] = value;
				break;
			case 1:
				if (numericKey && value.toString().length > 1) {
					this.inputThree.nativeElement.focus();
				}
				this.sortCode[1] = value;
				break;
			case 2:
				this.sortCode[2] = value;
				break;
		}

		const storeSortCode = this.sortCode.join('');
		this.onChange.emit({ ...this.model, value: storeSortCode });
	}

	// Manage delete
	public OnKeyDown(field, $event) {
		const backspaceKeyCode = 8;
		const deleteKeyCode = 46;
		const currentValue = this.sortCode[field].length;
		const key = $event.keyCode || $event.charCode;
		const deletePressed = key === backspaceKeyCode || key === deleteKeyCode;
		switch (field) {
			case 1:
				if (!currentValue && deletePressed) {
					this.inputOne.nativeElement.focus();
				}
				break;
			case 2:
				if (!currentValue && deletePressed) {
					this.inputTwo.nativeElement.focus();
				}
				break;
		}
	}

	public OnFocus(field) {
		this.analyticsService.trackFormFieldFocused(this.trackingFieldName);
		this.showPlaceholder = true;

		if (!this.sortCode[0] && (field === 1 || field === 2)) {
			this.inputOne.nativeElement.focus();
			this.inFocus.push(0);
		} else if (!this.sortCode[1].length && field === 2) {
			this.inputTwo.nativeElement.focus();
			this.inFocus.push(1);
		} else {
			this.inFocus.push(field);
		}

		this.renderer.addClass(document.body, 'input-focused');
	}

	public Blurred(field): void {
		this.inFocus = this.inFocus.filter(f => f !== field);
		this.hasBlurred = true;
		if (this.ErrorMessage.length) {
			this.analyticsService.trackFormFieldError(this.trackingFieldName, this.ErrorMessage);
		}

		this.renderer.removeClass(document.body, 'input-focused');
	}

	public OnFieldChange(field, $event) {
		const padNumberMaxThreshold = 100;
		const decimalRadix = 10;
		const value = $event.target.value;
		if (value) {
			const padValue = parseInt(value, decimalRadix) < padNumberMaxThreshold;
			this.SetValue(field, value, padValue);
		}
		this.showPlaceholder = this.SortCodeHasValue;
		this.inFocus = this.inFocus.filter(f => f !== field);
	}

	public OnLabelClick($event) {
		$event.preventDefault();
	}

	get SortCodeHasValue(): boolean {
		return !!(this.sortCode[0] || this.sortCode[1] || this.sortCode[2]);
	}

	get ShowValidationErrors(): boolean {
		return this.forceShowValidationErrors || this.hasBlurred;
	}

	get ErrorMessage(): string {
		return this.ShowValidationErrors && this.validationErrors && this.validationErrors.length ? this.validationErrors[0].errors[0] : '';
	}

	get IsValid(): boolean {
		return !this.ShowValidationErrors || this.validationErrors == null || this.validationErrors.length === 0;
	}

	get Classes(): string {
		return classNames({
			'Input--filled': this.SortCodeHasValue,
			'Input--valid': this.SortCodeHasValue && this.IsValid && !this.inFocus.length && !this.serverError,
			'Input--invalid': (!this.IsValid && !this.inFocus.length) || this.serverError,
			'Input--focused': !!this.inFocus.length,
			'js-invalid-input': !this.IsValid,
		});
	}

	get TitleClass(): string {
		return classNames({
			'Input__title--inactive': !this.inFocus.length,
		});
	}
}
