import { IValidated } from 'shared/models/validation.model';

export interface IAddress {
	Id: string;
	AddressLine1: string;
	AddressLine2?: string;
	AddressLine3?: string;
	Town: string;
	County?: string;
	Postcode: string;
}

export interface IAddressPickerDetails {
	AddressLine1: string;
	Postcode: string;
}

export interface IAddressConfig {
	address: IValidated<IAddress>;
	addressPickerValidator: any;
	AddressLine1: IAddressField;
	AddressLine2: IAddressField;
	AddressLine3: IAddressField;
	Town: IAddressField;
	County: IAddressField;
	Postcode: IAddressField;
	findAddressTitle: string;
	editAddressTitle: string;
	manualInputTitle: string;
	backToAddressSearchTitle: string;
	saveAddressTitle: string;
	noResultsError: string;
	addressDetailsError: string;
}

export interface IAddressField {
	title: string;
	manualTitle?: string;
}

export interface IAddressFieldEventPayload {
	field: keyof IAddress;
	value: string;
}

export interface IAddressOption {
	sId: string;
	sStreetAddress: string;
}

export interface IAddressDetail {
	sCompany: string;
	sLine1: string;
	sLine2?: string;
	sLine3?: string;
	sPostTown: string;
	sCounty: string;
	sPostcode: string;
}

export interface IAddressState extends IValidated<IAddress> {
	manuallyEditingAddress: boolean;
	hasChosenAddress: boolean;
}
