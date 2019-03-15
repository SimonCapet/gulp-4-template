import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from 'ukbc/reducers';
import { IVehicleState, IProduct, IErrorContent } from 'ukbc/models';
import { EVehicleRule } from 'shared/models';
import { CloseDialogAction, BeginDeselectProductAction } from 'ukbc/actions';
import { EValidationErrorType } from 'shared/enums';
import { EProductSelectionSource } from 'ukbc/enums';
import { punctuateList } from 'scripts/utils';

@Component({
	selector: 'ukbc-vsoe-error',
	templateUrl: './vsoe-error.component.html',
	styleUrls: ['./vsoe-error.component.scss'],
})
export class VSOEErrorComponent implements OnInit, OnDestroy {
	@Input() setOnClose: Function;

	private subscriptions: Subscription[] = [];
	private selectedVSOEProducts: IProduct[];
	private packageBelowUrl: string;
	private productsToRemove: IProduct[] = [];

	public VSOEErrors: string;
	public RemoveButtonTitle: string;
	public ErrorContent$: Observable<IErrorContent>;

	constructor(private store: Store<fromRoot.State>) {}

	ngOnInit() {
		this.subscriptions.push(this.store.select(fromRoot.getSelectedProducts).subscribe(this.setSelectedProducts.bind(this)));
		this.subscriptions.push(this.store.select(fromRoot.getInvalidVehicles).subscribe(this.setVSOEError.bind(this)));

		this.ErrorContent$ = this.store.select(fromRoot.getErrorsContent);

		this.store
			.select(fromRoot.getJourneyContent)
			.take(1)
			.subscribe(content => (this.packageBelowUrl = content.PackageBelowUrl));
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		this.subscriptions = [];
	}

	public CloseDialog(): void {
		this.store.dispatch(new CloseDialogAction('vsoe-error'));
	}

	public RemoveProduct(): void {
		this.store.dispatch(
			new BeginDeselectProductAction({
				productCodes: this.productsToRemove.map(p => p.ProductCode),
				source: EProductSelectionSource.VSOEErrorModal,
			})
		);
		this.CloseDialog();
	}

	private setSelectedProducts(products: IProduct[]): void {
		this.selectedVSOEProducts = products.filter(product => product.IsVSOE && product.VehicleRules);
	}

	private setVSOEError(vehicles: IVehicleState[]): void {
		const vehicle = vehicles.find(v => !!v.validationErrors.Mileage || !!v.validationErrors.Age || !!v.validationErrors.Fuel);

		if (vehicle) {
			const { Age, Mileage, Fuel } = vehicle.validationErrors;

			const rules: EVehicleRule[] = [];
			const values: Array<string | number | string[]> = [];

			if (Age && Age[0].type === EValidationErrorType.Max) {
				rules.push(EVehicleRule.MaxAge);
				values.push(Age[0].params.max);
			}

			if (Mileage && Mileage[0].type === EValidationErrorType.Max) {
				rules.push(EVehicleRule.MaxMileage);
				values.push(Mileage[0].params.max);
			}

			if (Fuel && Fuel[0].type === EValidationErrorType.NotInArray) {
				rules.push(EVehicleRule.FuelType);
				values.push(Fuel[0].params.array);
			}

			let productsToRemove = [];

			rules.forEach((rule, index) => {
				const value = values[index];
				const products = this.selectedVSOEProducts.filter(p => p.VehicleRules[rule].Value.toString() === value.toString());
				productsToRemove = [...productsToRemove, ...products];
			});

			const errorMessages: string[] = [];

			productsToRemove.forEach(p => {
				for (const key in p.VehicleRules) {
					if (p.VehicleRules.hasOwnProperty(key) && rules.includes(<EVehicleRule>key)) {
						errorMessages.push(p.VehicleRules[key].RemoveMessage);
					}
				}
			});

			this.VSOEErrors = Array.from(new Set(errorMessages))
				.map(error => `<p>${error}</p>`)
				.join('');

			this.productsToRemove = productsToRemove;

			this.RemoveButtonTitle = punctuateList(Array.from(new Set(productsToRemove.map(p => p.Title))));
		}
	}
}
