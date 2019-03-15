import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/take';
const isEqual = require('lodash/isEqual');

import {
	ISaveCoverPayload,
	ICoverContact,
	IConsent,
	ICoverPaymentType,
	ICoverDirectDebitInfo,
	ICoverVehicle,
	IAPIURLs,
	IRealexModel,
	IErrorContent,
	IGeneralContent,
	IInitialState,
	IEagleEyeState,
	ISaveCoverResponse,
} from 'ukbc/models';
import { EPaymentType, EYesNoType, EErrorCode, EPaymentCardType, ESaveCoverSource, EDetailsCardType } from 'ukbc/enums';
import * as coverActions from 'ukbc/actions';
import * as fromRoot from 'ukbc/reducers';
import * as paymentActions from 'ukbc/actions/payment.actions';
import * as errorActions from 'ukbc/actions/error.actions';
import * as sessionActions from 'ukbc/actions/session.actions';
import { HttpService } from 'shared/services';
import { IAddressState, IAddress } from 'shared/models';
import { CheckoutAnalyticsService } from 'ukbc/services/checkout-analytics.service';

@Injectable()
export class CoverService {
	private apiUrls: IAPIURLs;
	private content: IInitialState;
	private generalContent: IGeneralContent;
	private errorContent: IErrorContent;

	public PreviousCoverPayload: ISaveCoverPayload;

	constructor(
		private http: HttpClient,
		private store: Store<fromRoot.State>,
		private httpService: HttpService,
		private checkoutAnalyticsService: CheckoutAnalyticsService
	) {
		store
			.select(fromRoot.getAPIURLs)
			.take(1)
			.subscribe(apiUrls => (this.apiUrls = apiUrls));

		store
			.select(fromRoot.getContent)
			.take(1)
			.subscribe(content => (this.content = content));

		store
			.select(fromRoot.getGeneralContent)
			.take(1)
			.subscribe(generalContent => (this.generalContent = generalContent));

		store
			.select(fromRoot.getErrorsContent)
			.take(1)
			.subscribe(errorContent => (this.errorContent = errorContent));
	}

	public SaveCover(source?: ESaveCoverSource, openCard?: (EPaymentCardType | EDetailsCardType), retryCallback?: Function): Promise<any> {
		const sessionExpiry = new Date();
		sessionExpiry.setMilliseconds(sessionExpiry.getMilliseconds() + this.generalContent.ServerTimeout);

		this.store.dispatch(new sessionActions.SetSessionExpiryAction(sessionExpiry));

		const url = `${this.apiUrls.SaveWithRealexUrl}`;

		const PaymentTypesSelected = this.getPaymentTypesSelected();
		const RealexModel = this.getRealexModel();
		const eagleEyeToken = this.getEagleEyeVoucherDetails();

		const cover: ISaveCoverPayload = {
			SessionID: this.content.JID,
			SourceCode: this.content.ContentInformation.Journey.SourceCode,
			PromoCode: this.content.ContentInformation.Journey.PromoCode,
			PackageCode: this.content.PackageCode,
			AffinityCode: this.content.AffinityCode,
			BindChannelType: this.content.BindChannelType,
			BindSelectedItemsBitset: this.getBitset(),
			Contacts: this.getContacts(),
			Vehicles: this.getVehicles(),
			PaymentTypesSelected,
			DirectDebitInfo: this.getDirectDebitInfo(PaymentTypesSelected),
			StartDate: this.getStartDate(),
			CollectionDate: this.getCollectionDate(),
			DVCode: eagleEyeToken.code,
			DVValue: eagleEyeToken.amountInPence, // API requires amount to be sent through in pence
			JourneyVersion: this.content.JourneyVersion,
		};

		if (!this.PreviousCoverPayload || (this.PreviousCoverPayload && (!isEqual(this.PreviousCoverPayload, cover) || !RealexModel))) {
			this.store.dispatch(new paymentActions.ResetRealexModel());
			this.PreviousCoverPayload = cover;

			return new Promise((resolve, reject) => {
				return this.httpService
					.post(url, cover, {}, this.errorContent.SaveCoverTimeout)
					.toPromise()
					.then((response: ISaveCoverResponse) => {
						if (response.IsZeroPayment) {
							window.location.href = `${window.location.origin}${response.ZeroPaymentUrl}`;
						} else {
							this.store.dispatch(new coverActions.SetCoverSavingAction(false));
							this.store.dispatch(new paymentActions.SetPaymentOptionsAndRealexModel(response));
							resolve(response);
						}
					})
					.catch(error => {
						if (!error.handled) {
							let serverErrorTrackingString: string;

							switch (source) {
								case ESaveCoverSource.ChangeDirectDebitPaymentMethod:
									serverErrorTrackingString = 'save cover failure on changing direct debit payment method';

									this.store.dispatch(
										new errorActions.ShowErrorAction({
											errorCode: EErrorCode.ChangeDirectDebitPaymentMethodFailed,
											hideCloseButton: true,
											action: new coverActions.SaveCoverAction({ source }),
										})
									);
									break;
								case ESaveCoverSource.CheckCardValid:
									switch (openCard) {
										case EPaymentCardType.PaymentDetails:
											serverErrorTrackingString = 'save cover failure on click payment details section';
											break;
										default:
											serverErrorTrackingString = 'save cover failure on checking card valid';
									}
									this.store.dispatch(
										new errorActions.ShowErrorAction({
											errorCode: EErrorCode.SaveCoverCheckSectionCardValidFailed,
											hideCloseButton: true,
											retryCallback,
										})
									);
									break;
								case ESaveCoverSource.OnRefresh:
									serverErrorTrackingString = 'save cover failure on refresh';
									this.store.dispatch(
										new errorActions.ShowErrorAction({
											errorCode: EErrorCode.SaveCoverOnRefreshFailed,
											hideCloseButton: true,
											action: new coverActions.SaveCoverAction({ source }),
										})
									);
									break;
								default:
									serverErrorTrackingString = 'save cover failure';
							}

							if (error.name === 'TimeoutError') {
								serverErrorTrackingString += ' - timeout';
							}

							this.checkoutAnalyticsService.TrackServerError(serverErrorTrackingString);

							reject(error);
						}
					});
			});
		} else {
			return new Promise(resolve => resolve());
		}
	}

	private getStartDate(): string {
		let startDate: Date;

		this.store
			.select(fromRoot.getCoverStartDate)
			.take(1)
			.subscribe(d => (startDate = d));

		return new Date(startDate).toISOString();
	}

	private getBitset(): number {
		let bitset: number;

		this.store
			.select(fromRoot.getBitSet)
			.take(1)
			.subscribe(b => (bitset = b));

		return bitset;
	}

	private getAddress(): IAddress {
		let address: IAddressState;

		this.store
			.select(fromRoot.getAddress)
			.take(1)
			.subscribe(a => (address = a));

		return address.model;
	}

	private getConsent(): IConsent {
		let consent: IConsent;

		this.store
			.select(fromRoot.getConsent)
			.take(1)
			.subscribe(c => (consent = c.model));

		return consent;
	}

	private getContacts(): ICoverContact[] {
		let contacts: ICoverContact[];

		const address = this.getAddress();
		const consent = this.getConsent();

		this.store
			.select(fromRoot.getAllContacts)
			.take(1)
			.subscribe(
				s =>
					(contacts = s.contacts.map(c => {
						const coverContact: ICoverContact = {
							BindContactType: c.model.PrimaryMember ? 1 : 2,
							Title: c.model.Title,
							FirstName: c.model.FirstName,
							LastName: c.model.LastName,
							EmailAddress: c.model.Email,
							TelephoneNumber: c.model.PhoneNumber,
							DateOfBirth: new Date(c.model.DOB).toISOString(),
							AddressLine1: address.AddressLine1,
							AddressLine2: address.AddressLine2,
							AddressLine3: address.AddressLine3,
							Town: address.Town,
							County: address.County,
							PostCode: address.Postcode,
							AgreeTermsAndConditions: consent.AgreeTermsAndConditions,
							MarketingPreferences: consent.AgreeEmail,
							AgreeWelcomePost: consent.AgreePaperless === EYesNoType.Yes ? EYesNoType.No : EYesNoType.Yes,
							AgreeThirdPartyMarketing: EYesNoType.No,
						};

						return coverContact;
					}))
			);

		return contacts;
	}

	private getPaymentTypesSelected(): ICoverPaymentType {
		let coverPaymentType: ICoverPaymentType;

		this.store
			.select(fromRoot.getPayment)
			.take(1)
			.subscribe(
				p =>
					(coverPaymentType = {
						paymentType: p.model.paymentType,
						purchaseType: p.model.purchaseType,
						directDebitPaymentType: p.model.directDebitPaymentType,
						policyDuration: p.model.policyDuration,
					})
			);

		return coverPaymentType;
	}

	private getRealexModel(): IRealexModel {
		let realexModel: IRealexModel;

		this.store
			.select(fromRoot.getRealexModel)
			.take(1)
			.subscribe(model => (realexModel = model));

		return realexModel;
	}

	private getDirectDebitInfo(paymentType: ICoverPaymentType): ICoverDirectDebitInfo {
		let directDebitInfo: ICoverDirectDebitInfo;

		if (paymentType.paymentType === EPaymentType.DirectDebit) {
			this.store
				.select(fromRoot.getPayment)
				.take(1)
				.subscribe(
					p =>
						(directDebitInfo = {
							accountName: p.model.accountName,
							accountNumber: p.model.accountNumber,
							sortCode: p.model.sortCode,
							collectionDate: p.model.collectionDate,
						})
				);
		}

		return directDebitInfo;
	}

	private getCollectionDate(): string {
		let collectionDate: string;

		this.store
			.select(fromRoot.getCollectionDate)
			.take(1)
			.subscribe(date => (collectionDate = date));

		return collectionDate;
	}

	private getVehicles(): ICoverVehicle[] {
		let vehicles: Array<ICoverVehicle> = null;

		this.store
			.select(fromRoot.getVehicles)
			.take(1)
			.subscribe(s => {
				if (s.vehicles) {
					vehicles = s.vehicles.map(v => {
						const isFromLookup = v.model.LookupResponse !== null;
						const coverVehicle: ICoverVehicle = {
							VehicleAmended: v.manuallyEditing ? 'Y' : 'N',
							VehicleAge: isFromLookup ? v.model.LookupResponse.m_nAge : v.model.Age,
							VehicleMake: v.model.Make,
							VehicleModel: v.model.Model,
							Mileage: v.model.Mileage,
							VehicleRegistrationNumber: v.model.Vrm,
							VehicleVIN: isFromLookup ? v.model.LookupResponse.m_sVIN : '',
							VehicleFuelType: isFromLookup ? v.model.LookupResponse.m_sFuelDescription : v.model.Fuel,
							VehicleFuelTypeHPI: isFromLookup ? v.model.LookupResponse.m_sFuelDescription : v.model.Fuel,
							YearManufactured: v.model.Year,
						};
						return coverVehicle;
					});
				}
			});
		return vehicles;
	}

	private getEagleEyeVoucherDetails(): { code: string | null; amountInPence: number | null } {
		let code = null;
		let amountInPence = null;

		this.store
			.select(fromRoot.getEagleEyeState)
			.take(1)
			.subscribe((eagleEyeState: IEagleEyeState) => {
				if (eagleEyeState.token.model.value && eagleEyeState.isTokenVerified) {
					code = eagleEyeState.token.model.value;
					amountInPence = eagleEyeState.tokenValue && Math.round(eagleEyeState.tokenValue * 100);
				}
			});
		return { code, amountInPence };
	}
}
