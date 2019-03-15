import { IValidated } from 'shared/models';
import { EFuelType } from 'shared/enums';

const UUID = require('uuid/v4');

export class Vehicle {
	public ProductRules: IVehicleProductRules[] = [];

	constructor(
		public Vrm = '',
		public Make = '',
		public Model = '',
		public Year: number = null,
		public Mileage?: number,
		public Fuel?: EFuelType,
		public Age: number = null,
		public Id = UUID(),
		public LookupResponse: IVehicleLookupResponse = null,
		public AgeRule: IVehicleRuleConfig = null,
		public MileageRule: IVehicleRuleConfig = null,
		public FuelRule: IVehicleRuleConfig = null,
		public RequestMileage: boolean = false,
		public RequestFuel: boolean = false
	) {}
}
export interface IVehicleLookupFields {
	Vrm: string;
}

export interface IVehicleLookupConfig {
	Vehicle: IVehicleState;
	Vehicles: IVehicleState[];
	VehicleLookupValidatorGenerator: Function;
	LookupError: string;
	RegistrationTitle: string;
	MakeTitle: string;
	ModelTitle: string;
	YearTitle: string;
	MileageTitle: string;
	FuelTitle: string;
	FindVehicleTitle: string;
	EditVehicleTitle: string;
	SaveVehicleTitle: string;
	ManualModeTitle: string;
	LookupModeTitle: string;
	ErrorVehicleNotFound: string;
}

export interface IVehicleLookupResponse {
	HasErrored: boolean;
	HasWarning: boolean;
	m_nYearManufactured: number;
	m_sMakeDescription: string;
	m_sModelDescription: string;
	m_sVrm: string;
	m_sAmended: string;
	m_nAge: number;
	m_sVIN: string;
	m_sFuelDescription: string;
}

// Form field event payload
export interface IVehicleFields {
	vehicle: Vehicle;
	field: string;
	value: string;
}

export type ValidatedVehicle = IValidated<Vehicle>;

export interface IVehicleState extends ValidatedVehicle {
	manuallyEditing: boolean;
}

export enum EVehicleRule {
	MaxMileage = 'MaxMileage',
	MaxAge = 'MaxAge',
	FuelType = 'FuelType',
}

export interface IVehicleRuleConfig {
	Value: string | number | string[];
	Error: string;
	RemoveMessage: string;
	DowngradeMessage: string;
}

export interface IVehicleRules {
	MaxMileage: IVehicleRuleConfig;
	MaxAge: IVehicleRuleConfig;
	FuelType: IVehicleRuleConfig;
}

export interface IVehicleProductRules extends IVehicleRules {
	ProductCode: string;
}
