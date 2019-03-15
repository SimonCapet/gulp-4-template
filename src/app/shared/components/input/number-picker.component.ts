import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-number-picker',
	templateUrl: './number-picker.component.html',
	styleUrls: ['./number-picker.component.scss'],
})
export class NumberPickerComponent {
	@Input() min: number;
	@Input() max: number;
	@Input() value: number;
	@Output() onChange = new EventEmitter<number>();

	public ChangeValue(amount: number): void {
		this.onChange.emit(this.value + amount);
	}
}
