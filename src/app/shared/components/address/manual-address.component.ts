import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { IAddressConfig, IAddressFieldEventPayload } from 'shared/models';

@Component({
	selector: 'app-input-manual-address',
	templateUrl: './manual-address.component.html',
	styleUrls: ['./address.component.scss'],
})
export class InputManualAddressComponent implements OnInit {
	@Input() config: IAddressConfig;
	@Input() classes: string;
	@Input() forceShowValidationErrors: string;
	@Input() trackingFieldPrefix: string;
	@Output() setField = new EventEmitter<IAddressFieldEventPayload>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	public componentID: number;

	ngOnInit() {
		this.componentID = new Date().getUTCMilliseconds();
	}

	public InputChanged($event) {
		this.setField.emit($event);
	}

	public get Address() {
		return this.config.address.model;
	}

	public get ValidationErrors() {
		return this.config.address.validationErrors;
	}

	public TrackingFieldName(fieldName: string): string {
		return `${this.trackingFieldPrefix}${fieldName}`;
	}
}
