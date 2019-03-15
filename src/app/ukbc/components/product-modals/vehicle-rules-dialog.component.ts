import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { punctuateList } from 'scripts/utils';

import { IProduct, IGeneralContent, IVehicles, IVehicleState, Vehicle } from 'ukbc/models';
import {
	State,
	getGeneralContent,
	getVehicles,
	getInvalidAgeVehicles,
	getInvalidMileageVehicles,
	getCompletedVehicles,
	getForceShowValidationErrors,
	getVehiclesValidAndCompleted,
	getInvalidVehicles,
	getInvalidFuelVehicles,
} from 'ukbc/reducers';
import { CompleteVehicle, SetVehicleDetails } from 'ukbc/actions/vehicle.actions';
import {
	SetShowValidationErrors,
	ConfirmSelectProductAction,
	ConfirmDeselectProductAction,
	CloseDialogAction,
	AnswerQuestion,
} from 'ukbc/actions';
import { EDetailsCardType, EProductSelectionSource } from 'ukbc/enums';

@Component({
	selector: 'ukbc-vehicle-rules-dialog',
	templateUrl: './vehicle-rules-dialog.component.html',
	styleUrls: ['./vehicle-rules-dialog.component.scss'],
})
export class VehicleRulesDialogComponent implements OnInit, OnDestroy {
	@Input() selectedProducts: IProduct[];
	@Input() vehicleRulesProducts: IProduct[];
	@Input() questionId: string;
	@Input() setOnClose: Function;

	public ProductNames: string;
	public Description: string;
	public Content: IGeneralContent;
	public Vehicles$: Observable<IVehicles>;
	public CompletedVehicles$: Observable<string[]>;
	public InvalidVehicles$: Observable<IVehicleState[]>;
	public InvalidAgeVehicles$: Observable<IVehicleState[]>;
	public InvalidMileageVehicles$: Observable<IVehicleState[]>;
	public InvalidFuelVehicles$: Observable<IVehicleState[]>;
	public CompletedAndValid$: Observable<boolean>;
	public ForceShowValidationErrors$: Observable<boolean>;
	public MileageError: string;
	public AgeError: string;
	public FuelError: string;
	public VehiclesToCollect = 0;

	private focusedVehicleId: string;
	private vehiclesState: IVehicles;
	private subscriptions: Subscription[] = [];
	private productsAdded: boolean;

	constructor(private store: Store<State>) {
		store
			.select(getGeneralContent)
			.take(1)
			.subscribe(content => (this.Content = content));

		this.Vehicles$ = store.select(getVehicles);
		this.CompletedVehicles$ = store.select(getCompletedVehicles);
		this.InvalidVehicles$ = store.select(getInvalidVehicles);
		this.InvalidAgeVehicles$ = store.select(getInvalidAgeVehicles);
		this.InvalidMileageVehicles$ = store.select(getInvalidMileageVehicles);
		this.InvalidFuelVehicles$ = store.select(getInvalidFuelVehicles);
		this.ForceShowValidationErrors$ = store.select(getForceShowValidationErrors);
		this.CompletedAndValid$ = store.select(getVehiclesValidAndCompleted);
	}

	ngOnInit(): void {
		this.setContent();
		this.setOnClose(() => this.RemoveProducts(false));
		this.productsAdded = false;

		this.subscriptions.push(this.Vehicles$.subscribe(state => (this.vehiclesState = state)));

		this.vehicleRulesProducts.forEach(product => {
			product.AppliesToVehicles.forEach((applies, index) => {
				const number = index + 1;
				if (applies && this.VehiclesToCollect < number) {
					this.VehiclesToCollect = number;
				}
			});
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	public VehiclesChanged(index: number, vehicle: IVehicleState) {
		return vehicle.model.Id;
	}

	public OnVehicleFocus(event: FocusEvent, vehicle: IVehicleState): void {
		this.focusedVehicleId = vehicle.model.Id;
	}

	public IsFocused(vehicle: IVehicleState): boolean {
		return this.focusedVehicleId === vehicle.model.Id;
	}

	public SaveVehicle(vehicleId: string) {
		const vehicle = this.vehiclesState.vehicles.find(v => v.model.Id === vehicleId);
		if (vehicle.isValid) {
			this.showValidationErrors(false);
			this.store.dispatch(new CompleteVehicle({ id: vehicle.model.Id }));
		} else {
			this.showValidationErrors(true);
		}
	}

	public OnVehicleLookupComplete(vehicle: Vehicle) {
		this.showValidationErrors(false);
		this.store.dispatch(new SetVehicleDetails(vehicle));
		this.store.dispatch(new CompleteVehicle({ id: vehicle.Id }));
	}

	public RemoveProducts(close = true): void {
		if (!this.productsAdded) {
			this.store.dispatch(
				new ConfirmDeselectProductAction({
					productCodes: this.vehicleRulesProducts.map(p => p.ProductCode),
					source: EProductSelectionSource.ProductModal,
				})
			);
		}

		if (close) {
			this.closeDialog();
		}
	}

	public AddProducts(): void {
		this.productsAdded = true;
		this.store.dispatch(
			new ConfirmSelectProductAction({
				productCodes: this.vehicleRulesProducts.map(p => p.ProductCode),
				source: EProductSelectionSource.ProductModal,
				cardToComplete: EDetailsCardType.Vehicles,
			})
		);

		this.closeDialog();
	}

	private setContent(): void {
		this.ProductNames = punctuateList(this.vehicleRulesProducts.map(product => product.Title));
		this.Description = this.Content.VehicleRulesModalDescription.replace('{products}', this.ProductNames);

		this.MileageError = this.vehicleRulesProducts[0].VehicleRules.MaxMileage.RemoveMessage;
		this.AgeError = this.vehicleRulesProducts[0].VehicleRules.MaxAge.RemoveMessage;
		this.FuelError = this.vehicleRulesProducts[0].VehicleRules.FuelType.RemoveMessage;
	}

	private showValidationErrors(show: boolean): void {
		this.store.dispatch(new SetShowValidationErrors(show));
	}

	private closeDialog(): void {
		this.store.dispatch(new CloseDialogAction('vehicle-rules-dialog'));

		if (this.questionId) {
			this.store.dispatch(new AnswerQuestion(this.questionId));
		}
	}
}
