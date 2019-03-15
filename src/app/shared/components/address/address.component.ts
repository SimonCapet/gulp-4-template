import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { IAddressConfig, IAddress, IAddressFieldEventPayload, IAddressPickerDetails } from 'shared/models';
import { AnalyticsService } from 'shared/services';

@Component({
	selector: 'app-input-address',
	templateUrl: './address.component.html',
	styleUrls: ['./address.component.scss'],
})
export class InputAddressComponent {
	public AddressLoading = false;
	public NoSearchResultsMessage = '';
	public ChooseAddressError = '';

	@Input() config: IAddressConfig;
	@Input() classes: string;
	@Input() isManuallyEditing: boolean;
	@Input() hasChosenAddress: boolean;
	@Input() forceShowValidationErrors: boolean;
	@Output() setField = new EventEmitter<IAddressFieldEventPayload>();
	@Output() setAddress = new EventEmitter<IAddress>();
	@Output() onAddressOptionsFound = new EventEmitter<ElementRef>();
	@Output() onManualEditToggle = new EventEmitter<boolean>();
	@Output() onAddressChosen = new EventEmitter<void>();
	@Output() onAddressLoading = new EventEmitter<boolean>();
	@Output() onAddressSaved = new EventEmitter<void>();

	constructor(private analyticsService: AnalyticsService) {}

	public ToggleManualInput(): void {
		this.analyticsService.trackFormFieldFocused(
			!this.isManuallyEditing ? 'LeadMemberFindAddressManually' : 'LeadMemberBackToAddressSearch'
		);
		this.onManualEditToggle.emit(!this.isManuallyEditing);

		const newAddress: IAddress = {
			AddressLine2: '',
			AddressLine3: '',
			Town: '',
			County: '',
			...this.config.address.model,
		};
		this.setAddress.emit(newAddress);

		this.NoSearchResultsMessage = '';
		this.ChooseAddressError = '';
	}

	public OnAddressLoading(loading: boolean) {
		this.AddressLoading = loading;
		this.onAddressLoading.emit(loading);
	}

	public AddressOptionsFound($event) {
		this.onAddressOptionsFound.emit($event);
	}

	public AddressSelected(address: IAddress) {
		this.setAddress.emit(address);
		this.onAddressChosen.emit();
	}

	public EditAddress() {
		this.analyticsService.trackFormFieldFocused('LeadMemberEditAddress');
		this.onManualEditToggle.emit(true);
	}

	public ResetAddress(): void {
		this.setAddress.emit({
			Id: this.config.address.model.Id,
			AddressLine1: this.config.address.model.AddressLine1,
			AddressLine2: '',
			AddressLine3: '',
			Town: '',
			County: '',
			Postcode: this.config.address.model.Postcode,
		});
	}

	public SaveAddress() {
		this.onAddressSaved.emit();
	}

	public AddressNotFound(addressPickerOptions: IAddressPickerDetails) {
		this.ToggleManualInput();
		const postcode = addressPickerOptions.Postcode.toUpperCase();
		this.NoSearchResultsMessage = this.config.noResultsError
			? this.config.noResultsError.replace('{0}', postcode)
			: `No results found for ${postcode}. Please enter your address manually below`;
	}

	public OnChooseAddressError() {
		this.ToggleManualInput();
		this.ChooseAddressError = this.config.addressDetailsError;
	}

	public get Address(): IAddress {
		return this.config.address.model;
	}
}
