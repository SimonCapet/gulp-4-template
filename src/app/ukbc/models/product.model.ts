import { IVehicleRules } from 'shared/models';
import { ECoverBasis, EPreventSelectReason, EPurchaseType } from 'ukbc/enums';

export interface IProduct {
	ProductCode: string;
	ProductEnum: number;
	CoverBasis: ECoverBasis;
	CoverOption: string;
	ParentProduct?: string;
	AlternateProductCodes: string[];
	HasChildren: boolean;
	HideProductFromUI: boolean;
	Title: string;
	DisplayTitle: string;
	Description: string;
	DescriptionWhenAdded: string;
	BasketDescription: string;
	FreeProduct: boolean;
	MoreInfoTitle: string;
	MoreInfoDescription: string;
	PriceInfo?: string;
	index: number;
	SortOrder: number;
	CoverOptionsGroup: number;
	CoverOptionType: number;
	PreReqProduct?: string;
	PreReqMessage?: string;
	PreReqRemovedModalDescription?: string;
	PreReqRemovedModalMoreInfoLink?: string;
	PreReqRemovedModalMoreInfoText?: string;
	PreReqRemovedModalConfirmationButtonText?: string;
	PreReqRemovedModalCancelButtonText?: string;
	PreReqRequiredModalDescription?: string;
	PreReqRequiredModalMoreInfoLink?: string;
	PreReqRequiredModalMoreInfoText?: string;
	PreReqRequiredModalConfirmationButtonText?: string;
	PreReqRequiredModalCancelButtonText?: string;
	PreventSelect?: EPreventSelectReason[];
	VehicleRules?: IVehicleRules;
	AppliesToVehicles: boolean[];
	IsVSOE?: boolean;
	IsMultiProduct?: boolean;
	MultiProductID?: string;
	CoreProduct?: boolean;
	BasketBasisEditableTitle?: string;
	BasketBasisDisplayTitle?: string;
	DisallowedPurchaseType?: EPurchaseType;
	PurchaseTypeChangeRequiredModalDescription?: string;
	PurchaseTypeChangeRequiredModalConfirmationButtonText?: string;
	PurchaseTypeChangeRequiredModalCancelButtonText?: string;
	ChangePurchaseTypeRemoveProductsModalDescription?: string;
	ChangePurchaseTypeRemoveProductsModalConfirmationButtonText?: string;
	ChangePurchaseTypeRemoveProductsModalCancelButtonText?: string;
	RemovalWarning?: string;
	RemovalConfirm?: string;
	RemovalCancel?: string;
}

export interface IProductSelectableResponse {
	isSelectable: boolean;
}

export interface IAlternativeProductGroup {
	Id: string;
	ProductCodes: string[];
}

export interface IProductBasisValues {
	Value: number;
	Min: number;
	Max: number;
}

export interface IRemoveProductDialogFields {
	messages: string[];
	confirmButtonText: string;
	cancelButtonText: string;
	moreInfoButtonText: string;
	moreInfoText: string;
}
