import {
	Component,
	OnInit,
	OnChanges,
	Input,
	Output,
	EventEmitter,
	ChangeDetectorRef,
	ViewChild,
	ElementRef,
	ViewEncapsulation
} from '@angular/core';

import { IAddressConfig, IAddress, IAddressFieldEventPayload, IAddressOption, IAddressDetail, ISelectOption } from 'shared/models';
import { AddressService, AnalyticsService } from 'shared/services';
import { IAddressPickerDetails } from 'shared/models/address.model';
import { IValidated } from 'shared/models/validation.model';
import { validate } from 'shared/services/validator';
import classNames from 'classnames';

@Component({
	selector: 'app-input-address-picker',
	templateUrl: './address-picker.component.html',
	styleUrls: ['./address.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class InputAddressPickerComponent implements OnInit, OnChanges {
	@ViewChild('addressOptions') addressOptions: ElementRef;

	@Input() config: IAddressConfig;
	@Input() classes: string;
	@Input() addressPickerValidator: any;
	@Input() forceShowValidationErrors: string;
	@Input() trackingFieldPrefix: string;

	@Output() setAddressField = new EventEmitter<IAddressFieldEventPayload>();
	@Output() onAddressOptionsFound = new EventEmitter<ElementRef>();
	@Output() onAddressNotFound = new EventEmitter<IAddressPickerDetails>();
	@Output() onAddressChosen = new EventEmitter<IAddress>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onAddressLoading = new EventEmitter<boolean>();
	@Output() onChooseAddressError = new EventEmitter<void>();
	@Output() resetAddress = new EventEmitter<void>();

	private showValidation = false;
	public findingAddress = false;

	public AddressPickerDetails: IValidated<IAddressPickerDetails>;

	public options: ISelectOption[] = [];
	public selectedOption: string;
	public componentID: number;

	private changeEvents: Event[] = [];

	constructor(private addressService: AddressService, private cd: ChangeDetectorRef, private analyticsService: AnalyticsService) {}

	ngOnInit() {
		this.setValues();
		this.componentID = new Date().getUTCMilliseconds();
	}

	ngOnChanges() {
		this.setValues();
	}

	private setValues(): void {
		const { AddressLine1, Postcode } = this.config.address.model;
		this.AddressPickerDetails = validate(this.config.addressPickerValidator, { AddressLine1, Postcode });
	}

	public get AddressPickerModel() {
		return this.AddressPickerDetails.model;
	}

	public get ValidationErrors() {
		return this.AddressPickerDetails.validationErrors;
	}

	public get FindingAddress(): boolean {
		return this.findingAddress;
	}

	public set FindingAddress(finding: boolean) {
		this.findingAddress = finding;
		this.onAddressLoading.emit(finding);
	}

	public FindAddress(autoLookup = false): void {
		this.analyticsService.trackFormFieldFocused(`${this.trackingFieldPrefix}FindAddress`);

		if (!this.FindingAddress) {
			if (this.AddressPickerDetails.isValid) {
				this.clearOptions();
				this.showValidation = false;
				this.FindingAddress = true;
				this.addressService
					.GetAddressOptions(this.AddressPickerDetails.model.Postcode)
					.then(this.handleAddressOptionsLoaded.bind(this))
					.catch(() => {
						this.FindingAddress = false;
						this.onAddressNotFound.emit(this.AddressPickerDetails.model);
						this.showValidation = true;
					});

				this.cd.markForCheck();
			} else if (!autoLookup) {
				this.showValidation = true;
			}
		}
	}

	private handleAddressOptionsLoaded(options: IAddressOption[]): void {
		if (this.AddressPickerDetails.model.AddressLine1.length) {
			// Filter results to only contain matches with line1 match
			const filtered = options.filter(o =>
				o.sStreetAddress.toLowerCase().includes(this.AddressPickerDetails.model.AddressLine1.toLowerCase())
			);

			// Only use filtered list if there are results, otherwise show the original results
			if (filtered.length) {
				options = filtered;
			}
		}

		this.options = options.map(o => <ISelectOption>{ value: o.sId, text: o.sStreetAddress });

		if (options.length === 1) {
			this.SelectAddress(options[0].sId);
		} else if (options.length === 0) {
			this.FindingAddress = false;
			this.onAddressNotFound.emit(this.AddressPickerDetails.model);
		} else {
			setTimeout(() => {
				this.onAddressOptionsFound.emit(this.addressOptions);
				this.FindingAddress = false;
			}, 0);
		}

		this.cd.markForCheck();
	}

	private clearOptions(): void {
		this.options = [];
		this.selectedOption = undefined;
	}

	public SelectAddress(sId: string): void {
		this.FindingAddress = true;
		this.selectedOption = sId;

		this.addressService
			.GetAddressDetails(sId)
			.then(this.handleAddressDetailsLoaded.bind(this))
			.catch(() => {
				this.FindingAddress = false;
				this.onChooseAddressError.emit();
			});

		this.cd.markForCheck();
	}

	private handleAddressDetailsLoaded(details: IAddressDetail): void {
		const address = {
			Id: this.config.address.model.Id,
			AddressLine1: details.sCompany || details.sLine1,
			AddressLine2: details.sCompany ? details.sLine1 : details.sLine2,
			AddressLine3: details.sCompany ? details.sLine2 : details.sLine3,
			Town: details.sPostTown,
			County: details.sCounty,
			Postcode: details.sPostcode,
		};
		this.onAddressChosen.emit(address);
		this.FindingAddress = false;
		this.clearOptions();
	}

	public InputChanged($event) {
		this.setAddressField.emit($event);
		this.changeEvents.push($event);

		setTimeout(() => {
			this.resetAddress.emit();
		});

		if (this.changeEvents.length === 3) {
			setTimeout(() => this.FindAddress(true), 0);
		} else {
			setTimeout(() => (this.changeEvents = []), 100);
		}
	}

	public HandleKeypress($event: KeyboardEvent): void {
		switch ($event.key) {
			case 'Enter':
				// This is necessary to allow the postcode to get set before the find address function is run
				setTimeout(this.FindAddress.bind(this), 0);
				break;
			default:
				this.clearOptions();
		}
	}

	public get ShouldShowValidationErrors() {
		return this.showValidation || this.forceShowValidationErrors;
	}

	public get findButtonClasses() {
		return classNames({
			'Btn--loading Loader--loading': this.FindingAddress,
		});
	}

	public TrackingFieldName(fieldName: string): string {
		return `${this.trackingFieldPrefix}${fieldName}`;
	}
}
