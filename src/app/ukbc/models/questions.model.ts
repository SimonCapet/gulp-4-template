export interface IQuestion {
	Id: string; // UUID
	TimeTitle?: string; // String
	Title: string; // HTML - for Bold and colours
	Description: string; // HTML
	ModalContent?: string; // HTML
	MoreLabel?: string; // String
	OfferBanner?: string; // HTML - for Bold and colours
	InfoBanner?: string; // HTML - for Bold and colours
	ShowProgressBarOnActivate: boolean;
	ShowBasketOnActivate: boolean;
	YesButtonText: string; // Will not render if empty
	YesButtonActiveText?: string; // Will default to  YesButtonText if empty
	YesButtonCssClass?: string; // String to override CSS classes
	YesButtonProductsToAdd: string[]; // If none required empty array
	YesButtonHidePrice: boolean;
	NoButtonText: string; // Will not render if empty
	NoButtonActiveText?: string; // Will default to NoButtonText if empty
	NoButtonCssClass?: string; // String to override CSS classes
	NoButtonProductsToRemove: string[]; // If none required empty array
	IsBasis: boolean; // Will render number control
	// tslint:disable-next-line:max-line-length
	BasisParentProductCode?: string; // If set to VBM, will look for VBM1, VBM2, VBM3 in the AvailableProducts in the product store and set min and max accordingly, if PBM will look for PBM1, PBM2, PBM3, PBM4, PBM5.
	BasisNumberLabel?: string; // HTML - Text next to number picker. Placeholder for price can be added in the HTML if price required.
	HideFromProgress: boolean; // Does not add to active question progress bar count
}

export interface IQuestionState extends IQuestion {
	Active: boolean;
	Answered: boolean;
	Hidden: boolean;
	Index: number;
}
