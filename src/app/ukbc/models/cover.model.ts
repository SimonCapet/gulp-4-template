// This is API interface
import { IAddress } from 'shared/models';
import { Contact, IConsent } from 'ukbc/models';
import { EPaymentType, EPurchaseType, EDirectDebitPaymentType, EYesNoType, EPolicyDuration } from 'ukbc/enums';

export interface ICover {
	StartDate: Date;
	SavingCover: boolean;
}

export interface ISaveCoverPayload {
	SessionID: string;
	SourceCode: string;
	PromoCode: string;
	PackageCode: string;
	AffinityCode: string;
	BindChannelType: number;
	BindSelectedItemsBitset: number;
	Vehicles: ICoverVehicle[];
	Contacts: ICoverContact[];
	PaymentTypesSelected: ICoverPaymentType;
	DirectDebitInfo?: ICoverDirectDebitInfo;
	StartDate: string;
	CollectionDate?: string;
	DVCode?: string;
	DVValue?: number; // API requires amount to be sent through in pence
	JourneyVersion: string;
}

export interface IOrderUserModel {
	SelectedItemsBitset: number;
	BindSelectedItemsBitset: number;
	Contacts: ICoverContact[];
	PromoCode: string;
	SourceCode: string;
}

export interface ICoverContact {
	BindContactType: number;
	Title: string;
	FirstName: string;
	LastName: string;
	EmailAddress: string;
	TelephoneNumber: string;
	DateOfBirth: string;
	AddressLine1: string;
	AddressLine2: string;
	AddressLine3: string;
	Town: string;
	County: string;
	PostCode: string;
	AgreeTermsAndConditions: boolean;
	MarketingPreferences: EYesNoType | null;
	AgreeThirdPartyMarketing: EYesNoType;
	AgreeWelcomePost: EYesNoType | null;
}

export interface ICoverVehicle {
	VehicleAmended: string;
	VehicleAge: number;
	VehicleMake: string;
	VehicleModel: string;
	Mileage: number;
	VehicleRegistrationNumber: string;
	VehicleVIN: string;
	VehicleFuelType: string;
	VehicleFuelTypeHPI: string;
	YearManufactured: number;
}

export interface ICoverPaymentType {
	paymentType: EPaymentType;
	purchaseType: EPurchaseType;
	directDebitPaymentType: EDirectDebitPaymentType;
	policyDuration: EPolicyDuration;
}

export interface ICoverDirectDebitInfo {
	accountName: string;
	accountNumber: string;
	sortCode: string;
	collectionDate: string;
}
