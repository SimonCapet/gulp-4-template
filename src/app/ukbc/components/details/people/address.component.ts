import { Component, EventEmitter, Input, Output, ViewEncapsulation, OnChanges, ElementRef } from '@angular/core';
import { IAddress, IAddressFieldEventPayload } from 'shared/models';
import { IGeneralContent } from 'ukbc/models';
import { IAddressConfig } from 'shared/models';
import { addressPickerValidator } from 'ukbc/validation-rules';
import { IAddressState } from 'shared/models/address.model';

@Component({
	selector: 'ukbc-details-address',
	templateUrl: './address.component.html',
	styleUrls: ['./address.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class DetailsAddressComponent implements OnChanges {
	@Input() address: IAddressState;
	@Input() content: IGeneralContent;
	@Input() isOpen: boolean;
	@Input() isComplete: boolean;
	@Input() editAddress: boolean;
	@Input() forceShowValidationErrors: boolean;
	@Output() setField = new EventEmitter<IAddressFieldEventPayload>();
	@Output() setAddress = new EventEmitter<IAddress>();
	@Output() onAddressFound = new EventEmitter<void>();
	@Output() onAddressOptions = new EventEmitter<ElementRef>();
	@Output() onManualEditToggle = new EventEmitter<boolean>();
	@Output() onAddressChosen = new EventEmitter<void>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onAddressLoading = new EventEmitter<boolean>();
	@Output() onAddressSaved = new EventEmitter<void>();
	@Output() onOpen = new EventEmitter<void>();

	public Config: IAddressConfig;

	constructor() {}

	ngOnChanges() {
		this.Config = {
			address: this.address,
			addressPickerValidator: addressPickerValidator,
			AddressLine1: {
				title: this.content.AddressHouseNameLabel,
				manualTitle: this.content.AddressLine1Label,
			},
			AddressLine2: {
				title: this.content.AddressLine2Label,
			},
			AddressLine3: {
				title: this.content.AddressLine3Label,
			},
			Town: {
				title: this.content.AddressTownLabel,
			},
			County: {
				title: this.content.AddressCountyLabel,
			},
			Postcode: {
				title: this.content.AddressPostCodeLabel,
			},
			findAddressTitle: this.content.FindAddressButtonText,
			editAddressTitle: this.content.EditAddressButtonText,
			manualInputTitle: this.content.ManualAddressButtonText,
			backToAddressSearchTitle: this.content.BackToAddressSearch,
			saveAddressTitle: this.content.SaveAddress,
			noResultsError: this.content.ErrorNoAddressesFound,
			addressDetailsError: this.content.ErrorAddressDetails,
		};
	}

	public get Address() {
		return this.address.model;
	}

	public Open() {
		this.onOpen.emit();
		this.onManualEditToggle.emit(false);
	}

	public Edit() {
		this.onOpen.emit();
		this.onManualEditToggle.emit(true);
	}
}
