import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ElementRef, SimpleChanges } from '@angular/core';
import { Vehicle, IVehicleFields, IVehicleState, IJourneyContent } from 'ukbc/models';
import classNames from 'classnames';
import { IGeneralContent } from 'ukbc/models';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import * as vehicleActions from 'ukbc/actions/vehicle.actions';
import { IVehicleLookupConfig } from 'shared/models';
import { generateVehicleLookupValidator } from 'ukbc/validation-rules';
import * as dialogActions from 'ukbc/actions/dialog.actions';
import { EValidationErrorType } from 'shared/enums';
import { ViewportService } from 'ukbc/services';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';

@Component({
	selector: 'ukbc-details-vehicle',
	templateUrl: './vehicle.component.html',
})
export class DetailsVehicleComponent implements OnInit, OnChanges {
	@Input() vehicle: IVehicleState;
	@Input() vehicles: IVehicleState[];
	@Input() content: IGeneralContent;
	@Input() index: number;
	@Input() isOpen: boolean;
	@Input() isVehicleOpen: boolean;
	@Input() isVehicleComplete: boolean;
	@Input() isFocused: boolean;
	@Input() forceShowValidationErrors = false;
	@Input() hideTitle: boolean;
	@Input() preventScrollTo: boolean;
	@Input() shouldCheckForVSOEErrors = true;

	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onVehicleLoading = new EventEmitter<boolean>();
	@Output() onVehicleLookupComplete = new EventEmitter<Vehicle>();
	@Output() saveVehicle = new EventEmitter<string>();
	@Output() openCard = new EventEmitter();

	public VehicleLookupConfig: IVehicleLookupConfig;
	public JourneyContent$: Observable<IJourneyContent>;

	constructor(private store: Store<fromRoot.State>, private elementRef: ElementRef, private viewportService: ViewportService) {
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
	}

	ngOnInit() {
		this.checkForVSOEErrors();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.VehicleLookupConfig = {
			Vehicle: this.vehicle,
			Vehicles: this.vehicles,
			VehicleLookupValidatorGenerator: generateVehicleLookupValidator,
			LookupError: this.content.ErrorVehicleLookup,
			RegistrationTitle: this.content.VehicleRegistrationInputTitle,
			MakeTitle: this.content.VehicleMakeInputTitle,
			ModelTitle: this.content.VehicleModelInputTitle,
			YearTitle: this.content.VehicleYearInputTitle,
			FuelTitle: this.content.VehicleFuelInputTitle,
			MileageTitle: this.content.VehicleMileageInputTitle,
			FindVehicleTitle: this.content.FindVehicleButtonText,
			EditVehicleTitle: this.content.EditVehicle,
			SaveVehicleTitle: this.content.SaveVehicle,
			ManualModeTitle: this.content.ManuallyEditVehicleButton,
			LookupModeTitle: this.content.AutomaticallyFindVehicleDetailsButton,
			ErrorVehicleNotFound: this.content.ErrorVehicleNotFound,
		};

		if (!this.preventScrollTo && changes.isVehicleOpen && !changes.isVehicleOpen.previousValue && changes.isVehicleOpen.currentValue) {
			setTimeout(() => this.ScrollToVehicle(), 0);
		}
	}

	private ScrollToVehicle(): void {
		this.viewportService.ScrollToElement(<HTMLElement>this.elementRef.nativeElement);
	}

	public SetField(eventData: IVehicleFields): void {
		this.store.dispatch(new vehicleActions.SetVehicleField(eventData));
	}

	public OpenVehicle(): void {
		if (!this.isOpen) {
			this.openCard.emit();
		}
		this.store.dispatch(new vehicleActions.OpenVehicle({ id: this.vehicle.model.Id }));
	}

	public OnVehicleLookupComplete(vehicle: Vehicle) {
		this.onVehicleLookupComplete.emit(vehicle);
	}

	public SaveVehicle(): void {
		this.saveVehicle.emit(this.vehicle.model.Id);
	}

	public ToggleMode(manualEdit: boolean): void {
		this.store.dispatch(new vehicleActions.SetVehicleManualEdit({ id: this.vehicle.model.Id, manualEdit }));
	}

	public OnVehicleLoading(loading: boolean): void {
		this.onVehicleLoading.emit(loading);
	}

	public OnBlur($event: { $event: FocusEvent; model: any }): void {
		this.checkForVSOEErrors();
	}

	private checkForVSOEErrors(): void {
		if (this.shouldCheckForVSOEErrors) {
			const { Mileage, Age, Fuel } = this.vehicle.validationErrors;

			if (
				(Mileage && Mileage[0].type === EValidationErrorType.Max) ||
				(Age && Age[0].type === EValidationErrorType.Max) ||
				(Fuel && Fuel[0].type === EValidationErrorType.NotInArray)
			) {
				this.store.dispatch(new dialogActions.OpenDialogAction({ id: 'vsoe-error', hideCloseButton: true }));
			}
		}
	}

	public get VehicleClasses(): string {
		return classNames({
			'CardForm--completed': this.vehicle.isValid && !this.isFocused,
			'CardForm--open': this.isVehicleOpen,
			'CardForm--error': !this.vehicle.isValid && this.forceShowValidationErrors,
			'CardForm--incomplete': !this.isVehicleOpen && !this.isVehicleComplete,
		});
	}
}
