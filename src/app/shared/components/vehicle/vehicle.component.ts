import { Component, ViewEncapsulation, Input, Output, OnInit, OnChanges, EventEmitter, ChangeDetectorRef } from '@angular/core';
import classNames from 'classnames';

import {
	IVehicleLookupConfig,
	Vehicle,
	IVehicleLookupResponse,
	IVehicleFields,
	IVehicleLookupFields,
	IValidated,
	ISelectOption,
} from 'shared/models';
import { VehicleService, AnalyticsService, validate } from 'shared/services';
import { ValidationErrors } from '@angular/forms';
import { EFuelType } from 'shared/enums';

@Component({
	selector: 'app-input-vehicle',
	templateUrl: './vehicle.component.html',
	styleUrls: ['./vehicle.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class InputVehicleComponent implements OnInit, OnChanges {
	@Input() config: IVehicleLookupConfig;
	@Input() index: number;
	@Input() forceShowValidationErrors: boolean;
	@Input() isOpen: boolean;
	@Input() isVehicleOpen: boolean;
	@Input() isVehicleComplete: boolean;

	@Output() openVehicle = new EventEmitter();
	@Output() onVehicleLookupComplete = new EventEmitter<Vehicle>();
	@Output() saveVehicle = new EventEmitter();
	@Output() setField = new EventEmitter<IVehicleFields>();
	@Output() toggleMode = new EventEmitter<boolean>();
	@Output() onVehicleLoading = new EventEmitter<boolean>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onBlur = new EventEmitter<{ $event: FocusEvent; model: any }>();

	public VehicleLoading = false;
	public NoResults = false;
	public ValidatedVrm: IValidated<IVehicleLookupFields>;
	public FuelTypes: ISelectOption[] = [
		{ value: EFuelType.Petrol, text: 'Petrol' },
		{ value: EFuelType.Diesel, text: 'Diesel' },
		{ value: EFuelType.BiFuel, text: 'LPG' },
		{ value: EFuelType.Electric, text: 'Electric' },
		{ value: EFuelType.ElectricPetrol, text: 'Hybrid Electric (Petrol)' },
		{ value: EFuelType.ElectricDiesel, text: 'Hybrid Electric (Diesel)' },
		{ value: EFuelType.Other, text: 'Other' },
	];
	public Vehicle: Vehicle;
	public ValidationErrors: ValidationErrors;
	public MileageErrorTypeMax: boolean;
	public ShowErrors: boolean;
	public LookupError: string;
	public ManualMode: boolean;
	public ButtonClasses: string;
	public FuelType: string;

	private componentShowErrors = false;

	constructor(private vehicleService: VehicleService, private cd: ChangeDetectorRef, private analyticsService: AnalyticsService) {}

	ngOnInit(): void {
		this.setValidatedVrm();
	}

	ngOnChanges(): void {
		this.setValidatedVrm();
		this.setVehicle();
		this.setValidationErrors();
		this.setMileageErrorTypeMax();
		this.setFuelType();
		this.setShowErrors();
		this.setLookupError();
		this.setManualMode();
		this.setButtonClasses();
	}

	private setValidatedVrm(): void {
		const { Vrm, Mileage } = this.config.Vehicle.model;

		this.ValidatedVrm = validate(this.config.VehicleLookupValidatorGenerator(this.config.Vehicle.model, this.config.Vehicles), {
			Vrm,
			Mileage,
		});
	}

	public ToggleManualInput(): void {
		this.toggleMode.emit(!this.ManualMode);

		this.NoResults = false;

		const fieldName = this.ManualMode ? 'FindVehicleAuto' : 'EditVehicleManual';
		this.analyticsService.trackEvent('FormFieldClicked', { fieldName });
	}

	public OpenVehicle(): void {
		this.NoResults = false;
		this.openVehicle.emit();
	}

	public SaveVehicle(): void {
		this.saveVehicle.emit();
	}

	public InputChanged($event): void {
		this.setField.emit($event);
	}

	public HandleKeyPress($event: KeyboardEvent): void {
		switch ($event.key) {
			case 'Enter':
				setTimeout(this.LookupVehicle.bind(this), 0);
				break;
		}
	}

	public LookupVehicle(): void {
		if (!this.VehicleLoading) {
			this.analyticsService.trackEvent('FormFieldClicked', { fieldName: 'FindVehicle' });
			this.onVehicleLoading.emit();

			if (this.ValidatedVrm.isValid) {
				this.VehicleLoading = true;
				this.setButtonClasses();

				this.vehicleService
					.GetVehicleDetails(this.Vehicle.Vrm)
					.then(this.handleVehicleLoaded.bind(this))
					.catch(this.handleVehicleLookupError.bind(this));

				this.cd.markForCheck();
			} else {
				this.componentShowErrors = true;
				this.setShowErrors();
			}
		}
	}

	private handleVehicleLoaded(details: IVehicleLookupResponse): void {
		if (details.HasErrored || details.HasWarning) {
			this.ToggleManualInput();
			this.NoResults = true;
		} else {
			this.NoResults = false;
			const vehicle = <Vehicle>{
				...this.config.Vehicle.model,
				Make: details.m_sMakeDescription,
				Model: details.m_sModelDescription,
				Year: details.m_nYearManufactured,
				Fuel: details.m_sFuelDescription,
				LookupResponse: details,
			};

			this.onVehicleLookupComplete.emit(vehicle);
		}

		this.VehicleLoading = false;
		this.setButtonClasses();
	}

	private handleVehicleLookupError(): void {
		this.VehicleLoading = false;
	}

	public GetTrackingFieldName(field: string): string {
		return `Vehicle${this.index}${field}`;
	}

	private setVehicle(): void {
		this.Vehicle = this.config.Vehicle.model;
	}

	private setValidationErrors(): void {
		this.ValidationErrors = this.config.Vehicle.validationErrors;
	}

	private setMileageErrorTypeMax(): void {
		const mileageError = this.config.Vehicle.validationErrors.Mileage;

		this.MileageErrorTypeMax = mileageError && mileageError.length && mileageError[0].type === 'max';
	}

	private setShowErrors(): void {
		this.ShowErrors = this.forceShowValidationErrors || this.componentShowErrors;
	}

	private setLookupError(): void {
		if (!this.ShowErrors || !this.ValidatedVrm.isValid) {
			this.LookupError = '';
		} else {
			this.LookupError = this.config.LookupError;
		}
	}

	private setManualMode(): void {
		this.ManualMode = this.config.Vehicle.manuallyEditing;
	}

	private setFuelType(): void {
		const type = this.FuelTypes.find(fuelType => fuelType.value === this.config.Vehicle.model.Fuel);

		if (type) {
			this.FuelType = type.text || type.value;
		} else {
			this.FuelType = null;
		}
	}

	private setButtonClasses(): void {
		this.ButtonClasses = classNames({
			'js-invalid-input': !!this.LookupError,
			'Btn--loading Loader--loading': this.VehicleLoading,
		});
	}
}
