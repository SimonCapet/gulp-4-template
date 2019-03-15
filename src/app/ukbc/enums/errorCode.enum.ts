export enum EErrorCode {
	GetPricesError = 'GetPricesError',
	GetPricesTimeout = 'GetPricesTimeout',
	SessionExpiry = 'SessionExpiry',
	ChangeDirectDebitPaymentMethodFailed = 'ChangeDirectDebitPaymentMethodFailed',
	SaveCoverCheckSectionCardValidFailed = 'SaveCoverCheckSectionCardValidFailed',
	SaveCoverOnRefreshFailed = 'SaveCoverOnRefreshFailed',
	SetPaymentMethodFailed = 'SetPaymentMethodFailed',
	PaymentOptionsTimeout = 'PaymentOptionsTimeout',
	PaymentOptionsError = 'PaymentOptionsError',
	VerifyEagleEyeTokenTimeout = 'VerifyEagleEyeTokenTimeout',
	VerifyEagleEyeTokenFailed = 'VerifyEagleEyeTokenFailed',
}
