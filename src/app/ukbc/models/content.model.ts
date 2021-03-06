import { IAddress, IChatNowConfig } from 'shared/models';
import { EDirectDebitPaymentType, EPaymentType, EPurchaseType, EPolicyDuration } from 'ukbc/enums';
import { IJourneyContent, IStepConfig, IFaq, IInitialContact, IInitialVehicle, IAPIURLs, IProduct } from 'ukbc/models';

export interface IInitialState {
	ContentInformation: IContentInformation;
	ApiUrls: IAPIURLs;
	JID: string;
	PackageCode: string;
	AffinityCode: string;
	BindChannelType: number;
	AppLoadWarningModalContent: string;
	PreSelectedContacts?: IInitialContact[];
	PreSelectedAddress?: IAddress;
	PreSelectedVehicles?: IInitialVehicle[];
	PreSelectedCoverStartDate?: string;
	IsRenewal: boolean;
	IsDeepLinking: boolean;
	QueryString: boolean;
	JourneyVersion: string;
}

export interface IContentInformation {
	GeneralInfo: IGeneralContent;
	ProductList?: IProduct[];
	Journey: IJourneyContent;
	ErrorInfo: IErrorContent;
	Offer: IOfferContent;
	Package: IPackageContent;
	LiveChat: IChatNowConfig;
}

export interface IGeneralContent {
	RACLogoRedirectUrl: string;
	MonthlyLabel: string;
	AnnualLabel: string;
	AnnualPriceLowerHint: string;
	ProductAnnualLabel: string;
	ProductMonthlyLabel: string;
	AddProductButtonPriceSuffixAnnual: string;
	AddProductButtonPriceSuffixMonthly: string;
	BasketTotalTitle: string;
	ZeroPriceProductIndicatorText: string;
	OfferFlagBackgroundColor: string;
	OfferFlagTextColor: string;
	ServerTimeout: number;
	LandingPageUrl: string;
	FirstPageBackButtonTitle: string;
	FirstPageBackButtonLabel: string;
	HeaderPhoneNumberPreText: string;
	TodayLabel: string;
	TomorrowLabel: string;
	AnotherDateLabel: string;
	LCPMaxAdditionalMembers: number;
	LookAfterLinkLabel: string;
	LookAfterLinkContent: string;
	SelectedProductUndoTimeout?: number;
	HeadersBackgroundColour?: string;
	HeadersHeadlineTextColour?: string;
	HeadersStraplineTextColour?: string;
	AAFAnnualDoc: string;
	AAFMonthlyDoc: string;
	HowWouldYouLikeToPayHeading: string;
	ChoosePaymentMethodLabel: string;
	CustomerPaymentInformation: string;
	PaymentMethodLabel: string;
	PaymentByDebitCardLabel: string;
	PaymentByCreditCardLabel: string;
	PaymentByDirectDebitLabel: string;
	DirectDebitDetailsLabel: string;
	PaymentFrequency: string;
	CardPaymentAnnualLabel: string;
	CardPaymentMonthlyLabel: string;
	DirectDebitInformationMonthly: string;
	DirectDebitInformationAnnual: string;
	ErrorAccountNameRequired: string;
	ErrorAccountNumberRequired: string;
	ErrorAccountNumberNumbersOnly: string;
	ErrorAccountNumberMaxLength: string;
	ErrorCollectionDateRequired: string;
	ErrorSortCodeRequired: string;
	ErrorSortCodeNumbersOnly: string;
	ErrorSortCodeMinLength: string;
	DirectDebitAgreeToTermsAndConditionsInformation: string;
	DirectDebitAgreeToTermsWarningMessage: string;
	DirectDebitGuaranteeLinkLabel: string;
	DirectDebitGuaranteePrintLinkLabel: string;
	ServerErrorDirectDebitInvalidDetails: string;
	ServerErrorDirectDebitGenericError: string;
	DefaultPaymentType: EPaymentType;
	DefaultMonthlyPaymentType: EPaymentType;
	DefaultDirectDebitPaymentType: EDirectDebitPaymentType;
	DDGuaranteeHTML: string;
	DoNotRefreshMessage: string;
	CoverCheckMessageAnnual: string;
	CoverCheckMessageMonthly: string;
	HideDDCardSelection: boolean;
	AccountNameLabel: string;
	AccountNumberLabel: string;
	SortCodeLabel: string;
	CollectionDateLabel: string;
	CollectionDateCardLabel: string;
	CollectionDateSuffix: string;
	CollectionDateHelpPrefix: string;
	CollectionDateHelpSuffix: string;
	AnnualCollectionDateHelpPrefix: string;
	AnnualCollectionDateHelpSuffix: string;
	AddressPostCodeLabel: string;
	AddressLine1Label: string;
	AddressHouseNameLabel: string;
	AddressLine2Label: string;
	AddressLine3Label: string;
	AddressTownLabel: string;
	AddressCountyLabel: string;
	MembershipStartDateLabel: string;
	FindAddressButtonText: string;
	EditAddressButtonText: string;
	ManualAddressButtonText: string;
	BackToAddressSearch: string;
	ErrorTitleRequired: string;
	ErrorFirstNameRequired: string;
	ErrorFirstNameLength: string;
	ErrorFirstNameInvalid: string;
	ErrorSurnameRequired: string;
	ErrorSurnameLength: string;
	ErrorSurnameInvalid: string;
	ErrorEmailRequired: string;
	ErrorEmailInvalid: string;
	ErrorEmailLength: string;
	ErrorPhoneNumberRequired: string;
	ErrorPhoneNumberInvalid: string;
	ErrorPhoneNumberLength: string;
	ErrorDateOfBirthRequired: string;
	ErrorDateOfBirthIncomplete: string;
	ErrorDateOfBirthInalid: string;
	ErrorDateOfBirthRangeMinPrimary: string;
	ErrorDateOfBirthRangeMax: string;
	ErrorPostcodeRequired: string;
	ErrorPostcodeInvalid: string;
	ErrorPressFindAddressButton: string;
	ErrorAddressLineOneRequired: string;
	ErrorAddressLineOneLength: string;
	ErrorAddressLineOneInvalid: string;
	ErrorAddressLineTwoLength: string;
	ErrorAddressLineTwoInvalid: string;
	ErrorAddressLineThreeLength: string;
	ErrorAddressLineThreeInvalid: string;
	ErrorTownRequired: string;
	ErrorTownLength: string;
	ErrorTownInvalid: string;
	ErrorCountyLength: string;
	ErrorCountyInvalid: string;
	HintMembershipStartDate: string;
	ErrorMembershipStartDateInvalid: string;
	ErrorMembershipStartDateMin: string;
	ErrorMembershipStartDateMax: string;
	ErrorMembershipStartDateRequired: string;
	ErrorNoAddressesFound: string;
	ErrorDateOfBirthRangeMinSecondary: string;
	ErrorSortCodeMaxLength: string;
	ErrorAddressDetails: string;
	AdditionalMemberLabel: string;
	AddPerson: string;
	ShowUpsellPerson: boolean;
	RemovePerson: string;
	PbmMembersCardTitle: string;
	VbmMembersCardTitle: string;
	SavePerson: string;
	EditPerson: string;
	PrimaryMemberAdjective: string;
	AddressCardTitle: string;
	SaveAddress: string;
	EditAddress: string;
	VehiclesCardTitle: string;
	SaveVehicle: string;
	EditVehicle: string;
	CoverDateCardTitle: string;
	CoverRenewalDateCardTitle: string;
	SaveCoverStartDate: string;
	EditCoverStartDate: string;
	CoverStartsOnLabel: string;
	CoverRenewsOnLabel: string;
	ChooseManualCoverStartDateLabel: string;
	PaymentDetailsCardTitle: string;
	SavePaymentMethodMonthlyCard: string;
	SavePaymentMethodAnnualCard: string;
	SavePaymentMethodDirectDebit: string;
	SavePaymentMethodZeroPayment: string;
	EditPaymentDetails: string;
	TermsAndConditionsQuestion: string;
	TermsAndConditionsQuestionLabel: string;
	TermsAndConditionsAccept: string;
	TermsAndConditionsError: string;
	PaperlessTitle: string;
	PaperlessDescription: string;
	PaperlessCheckBoxLabel: string;
	EmailMarketingTitle: string;
	EmailMarketingDescription: string;
	EmailMarketingCheckBoxLabel: string;
	YesText: string;
	NoText: string;
	ErrorVehicleLookup: string;
	ErrorVehicleNotFound: string;
	ErrorVehicleRegistrationRequired: string;
	ErrorVehicleRegistrationLength: string;
	ErrorVehicleRegistrationPattern: string;
	ErrorVehicleRegistrationDuplicate: string;
	ErrorVehicleMakeRequired: string;
	ErrorVehicleModelRequired: string;
	ErrorVehicleYearRequired: string;
	ErrorVehicleValidYear: string;
	ErrorVehicleYearMin: string;
	ErrorVehicleMileageRequired: string;
	ErrorVehicleFuelRequired: string;
	ErrorVehicleValidMileage: string;
	VehicleRegistrationInputTitle: string;
	VehicleMakeInputTitle: string;
	VehicleModelInputTitle: string;
	VehicleYearInputTitle: string;
	VehicleMileageInputTitle: string;
	VehicleFuelInputTitle: string;
	FindVehicleButtonText: string;
	EditVehicleButtonText: string;
	ManuallyEditVehicleButton: string;
	AutomaticallyFindVehicleDetailsButton: string;
	AddVehicleButton: string;
	ShowUpsellVehicle: boolean;
	RemoveVehicleButton: string;
	VehicleTitle: string;
	ProductRemoveDialogJoin: string;
	VehicleRulesModalDescription: string;
	PolicyDetailsLabel: string;
	PolicyDetailsOneYearLabel: string;
	PolicyDetailsTwoYearLabel: string;
	PolicyDetailsTellMeMoreLabel: string;
	PolicyDetailsTellMeMoreInfo: string;
}

export interface IJourneyContent {
	IncludeStandardProducts: IStandardProduct[];
	HidePaymentOption: boolean;
	CoreProductCode: string;
	AdditionalMembersQuestion: boolean;
	AdditionalMembersAnswer: boolean;
	AnalyticsPrefix: string;
	JourneyType: string;
	JourneySiteName: string;
	HidePaymentOptionPrice: boolean;
	HidePackagePriceInBasket: boolean;
	HidePackagePriceInProduct: boolean;
	HidePackagePriceFreeInBasket: boolean;
	HidePaymentFrequencyToggle: boolean;
	HideHowWeLookAfterDataLink: boolean;
	HidePersonDetailsCardTitle: boolean;
	HideVehicleCountTitle: boolean;
	HideBasisItemInBasket: boolean;
	HideProgressHeaderSteps: boolean;
	HideCoverStartDate: boolean;
	TodayOnlyCoverStartDate: boolean;
	HideBasketToggle: boolean;
	HidePaymentDetails: boolean;
	HideAAF: boolean;
	IsStandaloneBasket: boolean;
	Steps: IStepConfig[];
	PromoCode: string;
	SourceCode: string;
	PreSelectedProducts: string[];
	ProductsInPackage: string[];
	LandingPageUrl: string;
	FirstPageBackButtonTitle: string;
	FirstPageBackButtonLabel: string;
	ShowMultiplePaymentCards: boolean;
	BasketHeaderTextColour: string;
	BasketHeaderBackgroundColour: string;
	BasketHeaderRadioColour: string;
	BasketHeaderLinkHoverColour: string;
	BasketPricesModalTrigger?: string;
	BasketPricesModalContent?: string;
	PackageBelowUrl?: string;
	TermsAndConditions: string;
	SinglePaymentFrequencyAvailable: boolean;
	FaqsTitle: string;
	Faqs: IFaq[];
	AllowPaymentByEagleEyeTokens: boolean; // Allows voucher codes to be applied (e.g. Tesco journey)
	ErrorEagleEyeTokenRequired: string;
	ErrorEagleEyeTokenInvalidFormat: string;
	EagleEyeInputLabel: string;
	EagleEyeTokenFormatRegex: string;
	EagleEyeActivateButton: string;
	EagleEyeTryAgainButton: string;
	EagleEyeLogoUrl: string;
	EagleEyeTokensNotAppliedText?: string; // e.g. 'No Tesco Clubcard discount applied'
	EagleEyeTokensAppliedText?: string; // Note: allows placeholder, e.g. '(eagleEyeTokenValue) Tesco Clubcard discount applied'
	EagleEyeTokensEquivalentValuePrefix?: string; // e.g. 'or'
	EagleEyeTokensEquivalentValueSuffix?: string; // e.g. 'worth of Tesco Clubcard vouchers'
	OriginalRacPriceLabel?: string; // e.g. 'Original RAC price:'
	EagleEyeTokensPartPayModalLinkText?: string; // e.g. 'Part pay available'
	EagleEyeTokensPartPayModalContent?: string;
	ExchangeEagleEyeTokensButtonText?: string;
	ExchangeEagleEyeTokensModalButtonText?: string;
	ExchangeEagleEyeTokensModalContent?: string;
	ExchangeEagleEyeTokensModalButtonUrl?: string;
	PaymentDetailsInformationMessage?: string;
	UTN: string;
	DefaultPaperlessOption: 'Yes' | 'No' | 'Unset';
	DefaultEmailMarketingOption: 'Yes' | 'No' | 'Unset';
	RenewalTimeoutRedirectURL?: string;
	AnnualComparisonBasketMessage?: string;
	MonthlyComparisonBasketMessage?: string;
	NewPriceLabel?: string;
	ComparisonPriceLabel?: string;
	UseComparisonPrice: boolean;
	AnnualFrequencyPaymentTypes: EPaymentType[];
	MonthlyFrequencyPaymentTypes: EPaymentType[];
	AnnualCancellationMessage: string;
	MonthlyCancellationMessage: string;
	WelcomeBackText: string;
	TwoYearPolicy: boolean;
	TwoYearPolicyDefault?: EPolicyDuration;
	TwoYearAllowPolicyLengthSelection: boolean;
}

export interface IStandardProduct {
	Title: string;
	Description: string;
	BasketDescription: string;
	DescriptionWhenAdded: string;
	ShowWhenProductSelected: [''];
	HideWhenProductSelected: [''];
}

export interface IPackageContent {
	ImageUrl: string;
	BulletBackgroundColor: string;
	TitleHighlightColor: string;
}

export interface IErrorContent {
	ChangeDirectDebitPaymentMethodFailedTitle: string;
	ChangeDirectDebitPaymentMethodFailedDescription: string;
	SaveCoverCheckSectionCardValidFailedTitle: string;
	SaveCoverCheckSectionCardValidFailedDescription: string;
	SaveCoverOnRefreshFailedTitle: string;
	SaveCoverOnRefreshFailedDescription: string;
	SetPaymentMethodFailedTitle: string;
	SetPaymentMethodFailedDescription: string;
	GetPricesErrorTitle: string;
	GetPricesErrorDescription: string;
	GetPricesTimeout: number;
	GetPricesTimeoutTitle: string;
	GetPricesTimeoutDescription: string;
	AddressTimeout: number;
	VehicleTimeout: number;
	PaymentOptionsTimeout: number;
	PaymentOptionsTimeoutTitle: string;
	PaymentOptionsTimeoutDescription: string;
	PaymentOptionsErrorTitle: string;
	PaymentOptionsErrorDetails: string;
	ValidateDirectDebitTimeout: number;
	SaveCoverTimeout: number;
	SaveCoverTimeoutTitle: string;
	SaveCoverTimeoutDescription: string;
	VSOEErrorModalTitle: string;
	VSOEErrorChangeVehicle: string;
	VSOEErrorDowngradePackage: string;
	EagleEyeVerificationTimeout: number;
}

export interface IOfferContent {
	Code: string;
	Title: string;
	Type: number;
	DisplayMessageWithPrice: boolean;
	ExtraIconClass: string;
	DisplayOfferBanner: boolean;
	AllowRedirectToPage2: boolean;
	OfferProducts: IOfferProduct[];
	OfferThresholds: IOfferThreshold[];
}

export interface IOfferProduct {
	Available: boolean;
	TextToDisplay: string;
	TextToDisplayIfPrerequisiteRequired: string;
	BackgroundColour: string | null;
	Products: string[];
	PrerequisiteProductCodeSelection: string[];
	IncompatibleProductCodeSelection: string[];
	DisplayTextIfSelected: boolean;
	RemovalModalContent: string;
	RemovalModalConfirmText: string;
	RemovalModalCancelText: string;
	PrerequisiteRemovalModalContent: string;
	PrerequisiteRemovalModalConfirm: string;
	PrerequisiteRemovalModalCancel: string;
	AvailableFor: EPurchaseType[];
}

export interface IOfferThreshold {
	Amount: number;
	BasketMessage: string;
	UpsellMessageAnnual: string;
	UpsellMessageMonthly: string;
}
