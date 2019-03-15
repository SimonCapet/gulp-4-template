import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IVehicleState, Vehicle } from 'shared/models/vehicle.model';
import { IGeneralContent, IVehicles } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';
import * as vehicleActions from 'ukbc/actions/vehicle.actions';

@Component({
	selector: 'ukbc-details-vehicles',
	templateUrl: './vehicles.component.html',
	styleUrls: ['./vehicles.component.scss'],
})
export class DetailsVehiclesComponent implements OnInit, OnDestroy {
	@Input() vehiclesState: IVehicles;
	@Input() isOpen: boolean;
	@Input() isComplete: boolean;
	@Input() forceShowValidationErrors = false;

	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() onVehicleLoading = new EventEmitter<boolean>();
	@Output() showValidationErrors = new EventEmitter<boolean>();
	@Output() openCard = new EventEmitter();
	@Output() completeCard = new EventEmitter();

	private subscriptions: Subscription[] = [];

	private focusedVehicleId: string;

	public Content: IGeneralContent;
	public MaxProducts$: Observable<number>;

	constructor(private store: Store<fromRoot.State>) {
		this.MaxProducts$ = store.select(fromRoot.getMaxVbmProducts);
	}

	ngOnInit() {
		this.subscriptions.push(
			this.store.select(fromRoot.getGeneralContent).subscribe(content => {
				this.Content = content;
			})
		);
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		this.subscriptions = [];
	}

	public VehiclesChanged(index, vehicle: IVehicleState) {
		return vehicle.model.Id;
	}

	public IsFocused(vehicle: IVehicleState) {
		return this.isOpen && this.focusedVehicleId === vehicle.model.Id;
	}

	public OnVehicleFocus(event: FocusEvent, vehicle: IVehicleState) {
		this.focusedVehicleId = vehicle.model.Id;
		this.onFocus.emit(event);
	}

	public isVehicleComplete(id: string): boolean {
		return this.vehiclesState.completedVehicles.find(vehicleId => vehicleId === id) != null;
	}

	public OpenCard() {
		this.openCard.emit();
	}

	private completeCardIfLastVehicle(vehicleId: string): void {
		const { vehicles } = this.vehiclesState;
		if (vehicles.map(v => v.model.Id).indexOf(vehicleId) === vehicles.length - 1) {
			setTimeout(() => this.completeCard.emit(), 0);
		}
	}

	public SaveVehicle(vehicleId: string) {
		const vehicle = this.vehiclesState.vehicles.find(v => v.model.Id === vehicleId);
		if (vehicle.isValid) {
			this.showValidationErrors.emit(false);
			this.store.dispatch(new vehicleActions.CompleteVehicle({ id: vehicle.model.Id }));
			this.completeCardIfLastVehicle(vehicle.model.Id);
		} else {
			this.showValidationErrors.emit(true);
		}
	}

	public OnVehicleLookupComplete(vehicle: Vehicle) {
		this.showValidationErrors.emit(false);
		this.store.dispatch(new vehicleActions.SetVehicleDetails(vehicle));
		this.store.dispatch(new vehicleActions.CompleteVehicle({ id: vehicle.Id }));
		this.completeCardIfLastVehicle(vehicle.Id);
	}
}
