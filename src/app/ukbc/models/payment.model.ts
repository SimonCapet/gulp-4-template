import { EPaymentType, EPurchaseType, EDirectDebitPaymentType, EPolicyDuration } from 'ukbc/enums';
import { IValidated } from 'shared/models/validation.model';

export interface IPayment {
	paymentType: EPaymentType;
	directDebitPaymentType: EDirectDebitPaymentType;
	purchaseType: EPurchaseType;
	policyDuration: EPolicyDuration;
	accountName: string;
	accountNumber: string;
	sortCode: string;
	collectionDate: string;
}

export interface IDirectDebitModel {
	CoverTypeCode: string;
	AnnualDirectDebitMessage: string;
	MonthlyDirectDebitMessage: string;
}

export interface IRealexModel {
	PaymentGatewayURL?: string;
	PaymentGatewayUrlXdevice?: string;
	IframeId?: string;
	RedirectUrl?: string;
	OrderId?: string;
	PaymentId?: number;
}

export interface IPaymentOptions {
	JID: string;
	DirectDebitModel: IDirectDebitModel;
	RealexModel: IRealexModel;
	AAFMessageToDisplay: string;
	MonthlyOnCardPaymentDescription: string;
	MonthlyDiscountedInstallmentFrequencyText: string;
	MonthlyDiscountedInstallmentSuffix: string;
	TwoYearPolicyMessage: string;
}

export interface ISaveCoverResponse extends IPaymentOptions {
	RealexModel: IRealexModel;
	IsZeroPayment: boolean;
	ZeroPaymentUrl: string;
}

export interface IRetry {
	show: boolean;
	message: string;
}

export interface IPaymentState {
	payment: IValidated<IPayment>;
	retry: IRetry;
	options: IPaymentOptions;
	optionsLoading: boolean;
	agreeToDirectDebitTermsAndConditions: IValidated<boolean>;
	iframeLoading: boolean;
	aafAnnualDoc: string;
	aafMonthlyDoc: string;
	availablePaymentTypes: EPaymentType[];
	canChangeFrequency: boolean;
}

export interface ISetPaymentMethodModel {
	paymentType: EPaymentType;
	directDebitPaymentType: EDirectDebitPaymentType;
}

export interface IRealexTimingsModel {
	RealexFrameId: string;
	StartTime: number;
	EndTime: number;
}
