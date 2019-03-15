import { EPurchaseType, EPolicyDuration } from 'ukbc/enums';

export interface IProductPrice {
	Total?: number;
	Diff?: number;
}
export interface IProductPrices {
	[productCode: string]: IProductPrice;
}

export interface ITotalPrice {
	annual: number;
	twoYear: number;
	annualWithoutDiscount: number;
	annualUsingEagleEyeVouchers?: number;
	comparisonAnnual?: number;
	monthly: number;
	comparisonMonthly?: number;
}

export interface IPriceState {
	total: ITotalPrice;
	annualPrices: IProductPrices;
	monthlyPrices: IProductPrices;
	twoYearPrices: IProductPrices;
	comparisonAnnualPrices: IProductPrices;
	comparisonMonthlyPrices: IProductPrices;
	received: boolean; // used for prices intialisation
	receiving: boolean;
	frequency: EPurchaseType;
	duration: EPolicyDuration;
	MonthlyDiscountedInstallmentPrefix?: string;
	MonthlyDiscountedInstallmentSuffix?: string;
	twoYearPolicyMessage: string;
}

export interface IPrice {
	total: number;
	totalWithoutDiscount: number;
	totalToPayUsingEagleEyeVouchers?: number;
	comparisonTotal: number;
	prices: IProductPrices;
	received: boolean;
	receiving: boolean;
	frequency: EPurchaseType;
	duration: EPolicyDuration;
}

export interface IAnnualAndMonthly {
	annual: number;
	monthly: number;
	twoYear: number;
}

export interface IPricesResponse {
	AnnualPrices: IProductPrices;
	MonthlyPrices: IProductPrices;
	TwoYearPrices: IProductPrices;
	ComparisonAnnualPrices?: IProductPrices;
	ComparisonMonthlyPrices?: IProductPrices;
	TotalToPay: number;
	TotalToPayWithDiscount: number;
	TwoYearPolicyTotalToPay: number;
	TotalToPayUsingVouchers?: number;
	ComparisonTotalToPay?: number;
	MonthlyAmount: number;
	DiscountedMonthlyAmount: number;
	ComparisonMonthlyAmount?: number;
	MonthlyDiscountedInstallmentPrefix?: string;
	MonthlyDiscountedInstallmentSuffix?: string;
	TwoYearPolicyMessage: string;
}

export interface ITotalResponse {
	TotalToPayWithDiscount: number;
	MonthlyAmount: number;
}
