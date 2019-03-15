import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/empty';
import { Store, Action } from '@ngrx/store';

import { IPayment, IPaymentOptions, IAPIURLs, IRealexTimingsModel, IErrorContent } from 'ukbc/models';
import { EErrorCode, EPaymentCardType } from 'ukbc/enums';

import * as paymentActions from 'ukbc/actions/payment.actions';
import * as errorActions from 'ukbc/actions/error.actions';
import * as fromRoot from 'ukbc/reducers';

import { HttpService } from 'shared/services';
import { CheckoutAnalyticsService } from 'ukbc/services/checkout-analytics.service';
import { CardType } from 'ukbc/models/card.model';

export interface Window {
	attachEvent(event: string, listener: EventListener): boolean;
	detachEvent(event: string, listener: EventListener): void;
}

@Injectable()
export class PaymentService {
	private apiUrls: IAPIURLs;
	private errorContent: IErrorContent;
	private payment$: Observable<IPayment>;
	private payment: IPayment;
	private options: IPaymentOptions;
	private bitSet: number;
	private eagleEyeVoucherAmount: number;
	private realexIframeLoadTime: number;
	private realexStartTime: Date;
	private realexEndTime: Date;
	private errorOccured = false;

	private sessionExpiry: Date;
	private sessionExpiryTimer: number;

	constructor(
		private http: HttpClient,
		private store: Store<fromRoot.State>,
		private httpService: HttpService,
		private checkoutAnalyticsService: CheckoutAnalyticsService
	) {
		store
			.select(fromRoot.getAPIURLs)
			.take(1)
			.map(apiUrls => (this.apiUrls = apiUrls))
			.subscribe();

		store
			.select(fromRoot.getErrorsContent)
			.take(1)
			.map(errorContent => (this.errorContent = errorContent))
			.subscribe();

		store
			.select(fromRoot.getPayment)
			.map(payment => {
				this.payment = payment.model;
			})
			.subscribe();

		store
			.select(fromRoot.getPaymentOptions)
			.map(options => {
				this.options = options;
			})
			.subscribe();

		this.subscribeToBitSet();

		(<any>window).addEventListener('message', this.receiveMessage.bind(this), false);

		setTimeout(() => {
			this.subscribeToPayment();
			this.subscribeToSessionExpiry();
		}, 0);
	}

	public LoadPaymentOptions(payment: IPayment, source: string, actions: Action[], openCardType?: CardType | null): void {
		if (payment.paymentType && payment.purchaseType) {
			this.store.dispatch(new paymentActions.GetPaymentOptionsAction());

			let url = `${this.apiUrls.CalculatedPaymentUrl}&selBit=${this.bitSet}`;
			if (this.eagleEyeVoucherAmount != null) {
				url += `&va=${this.eagleEyeVoucherAmount}`;
			}

			this.httpService
				.post(url, payment, {}, this.errorContent.PaymentOptionsTimeout)
				.toPromise()
				.then(options => {
					this.store.dispatch(new paymentActions.SetPaymentOptionsAction(options));
				})
				.catch(error => {
					if (!error.handled) {
						if (error.name === 'TimeoutError') {
							this.checkoutAnalyticsService.TrackServerError('get payment options timed out');

							this.store.dispatch(
								new errorActions.ShowErrorAction({
									errorCode: EErrorCode.PaymentOptionsTimeout,
									hideCloseButton: true,
									action: new paymentActions.ResetPaymentOptionsAction(),
								})
							);
						} else {
							switch (source) {
								case paymentActions.SET_PAYMENT_METHOD:
									let serverErrorTrackingString = 'setting payment method failed';

									if (openCardType) {
										switch (openCardType) {
											case EPaymentCardType.CoverStartDate:
												serverErrorTrackingString = 'default payment options failure on click cover start date';
												break;
											case EPaymentCardType.PaymentDetails:
												serverErrorTrackingString = 'setting payment method failure on click payment method';
												break;
										}
									}

									this.checkoutAnalyticsService.TrackServerError(serverErrorTrackingString);

									this.store.dispatch(
										new errorActions.ShowErrorAction({
											errorCode: EErrorCode.SetPaymentMethodFailed,
											hideCloseButton: true,
											action: new paymentActions.ResetPaymentOptionsAction(),
										})
									);
									break;
								default:
									this.store.dispatch(
										new errorActions.ShowErrorAction({
											errorCode: EErrorCode.PaymentOptionsError,
											hideCloseButton: true,
											action: new paymentActions.ResetPaymentOptionsAction(),
										})
									);
							}
						}
					}
				});
		}
	}

	public ValidateDirectDebit({ accountName, accountNumber, sortCode }: IPayment) {
		return this.httpService
			.post(this.apiUrls.ValidateDirectDebit, { accountName, accountNumber, sortCode }, {}, this.errorContent.ValidateDirectDebitTimeout)
			.toPromise();
	}

	private receiveMessage(event) {
		// ensure that the data field is a string, and that the origin is from realex.
		// if either untrue, then this could be an extension on a browser using the message event.
		if (typeof event.data !== 'string' || event.origin.toLowerCase().indexOf('realex') === -1) {
			return;
		}

		// try to catch any response that not in json format
		try {
			// Post json response -- any failure will be caught
			const hppMessage = JSON.parse(event.data);
			// There is another api use message listener for EBC, has to be handled here
			if (typeof hppMessage.PrivacyManagerAPI === 'undefined') {
				this.postHPPResponse(JSON.stringify(hppMessage));
			}
		} catch (error) {
			if (!error.handled) {
				// an error may appear here if the response from realex has html tags.
				// post this response to another method which strips out the tags.
				const orderId = this.options.RealexModel.OrderId;
				if (orderId !== null) {
					// post response with error message
					this.postAllHppResponse(event, orderId, error.message);
				} else {
					const errorMessage = 'Payment service is down, please call customer service';
					alert(errorMessage);
					this.checkoutAnalyticsService.TrackServerError(errorMessage);
					(<any>window).location.replace(this.options.RealexModel.RedirectUrl);
				}
			}
		}
		return 0;
	}

	public RetryRealexPayment(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.store.dispatch(new paymentActions.HideRealexRetry());
			this.httpService
				.post(this.options.RealexModel.RedirectUrl, {
					response: this.options.RealexModel.PaymentId,
					isRetry: true,
				})
				.toPromise()
				.then(response => {
					if (response.Success) {
						this.submitRealexForm(response)
							.then(resolve)
							.catch(reject);
					} else {
						const errorMessage = 'Realex retry failed';
						console.error(errorMessage, response);
						reject(errorMessage);
						this.checkoutAnalyticsService.TrackServerError(errorMessage);
					}
				})
				.catch(error => {
					const errorMessage = 'Realex retry failed';
					console.error(errorMessage, error);
					reject(error);
					this.checkoutAnalyticsService.TrackServerError(errorMessage);
				});
		});
	}

	public CreateIframe(): Promise<void> {
		this.iframeLoading = true;
		return new Promise(resolve => {
			this.RemoveIframe();
			const iframeContainer = <HTMLFrameElement>document.getElementById('realexIframeContainer');
			const iframe = document.createElement('iframe');
			iframe.setAttribute('name', this.options.RealexModel.IframeId);
			iframe.setAttribute('class', 'realex-iframe');
			iframe.setAttribute('scrolling', 'no');
			iframeContainer.appendChild(iframe);
			iframe.onload = () => {
				this.iframeLoading = false;
				// Stop logging realex time here.
				this.logIframeLoadTime(false);
				resolve();
			};
			this.requestIframe();
		});
	}

	public RemoveIframe() {
		const currentIframe = document.getElementsByTagName('iframe');
		if (currentIframe.length) {
			currentIframe[0].parentNode.removeChild(currentIframe[0]);
		}
	}

	public ResetRealexModel() {
		this.store.dispatch(new paymentActions.ResetRealexModel());
	}

	/**
	 * Method to log and caculate realex iframe load time.
	 * @param {boolean} start
	 */
	public logIframeLoadTime(start = true) {
		// Set start time
		if (start) {
			this.realexStartTime = new Date();
		}
		// Set end time, calculate difference, save and output result.
		if (!start) {
			this.realexEndTime = new Date();
			this.realexIframeLoadTime = this.realexEndTime.getTime() - this.realexStartTime.getTime();

			const timingsPayload: IRealexTimingsModel = {
				RealexFrameId: this.options.RealexModel.IframeId,
				StartTime: this.realexStartTime.getTime(),
				EndTime: this.realexEndTime.getTime(),
			};

			this.store.dispatch(new paymentActions.SaveIframeLoadingTime(timingsPayload));
		}
	}

	public saveRealexTimings(timings) {
		return this.httpService.post(this.apiUrls.RealexTimingsUrl, timings);
	}

	private set iframeLoading(loading: boolean) {
		this.store.dispatch(new paymentActions.SetIframeLoading(loading));
	}

	private subscribeToPayment(): void {
		this.store
			.select(fromRoot.getPayment)
			.subscribe(p => {
				this.LoadPaymentOptions(p.model, '', []);
			})
			.unsubscribe();
	}

	private subscribeToSessionExpiry(): void {
		this.store.select(fromRoot.getSessionExpiry).subscribe(expiry => {
			if (expiry) {
				this.sessionExpiry = new Date(expiry);
				this.beginSessionExpiryChecks();
			}
		});
	}

	private subscribeToBitSet(): void {
		this.store.select(fromRoot.getBitSet).subscribe(b => (this.bitSet = b));
	}

	private subscribeToEagleEyeTokenValue(): void {
		this.store.select(fromRoot.getEagleEyeTokenValue).subscribe(voucherAmount => (this.eagleEyeVoucherAmount = voucherAmount));
	}

	private postHPPResponse(responseData, orderId = '') {
		this.iframeLoading = true;
		this.httpService
			.post(this.options.RealexModel.RedirectUrl, {
				response: responseData,
				reference: orderId,
			})
			.toPromise()
			.then(response => {
				if (!response.Success && !response.MaxAttempt) {
					this.RemoveIframe();
					this.store.dispatch(
						new paymentActions.UpdateRealexModel({
							PaymentId: response.PaymentId,
							RedirectUrl: response.RedirectUrl,
						})
					);
					this.store.dispatch(new paymentActions.ShowRealexRetry(response.RealexMessage));
					this.iframeLoading = false;
					const errorMessage = `${response.RealexCode} - ${response.RealexMessage}`;
					this.checkoutAnalyticsService.TrackServerError(errorMessage);
				} else if (response.Success || response.MaxAttempt) {
					(<any>window).location.replace(response.RedirectUrl);
				}
			})
			.catch(error => {
				this.RemoveIframe();
				this.store.dispatch(new paymentActions.ShowRealexRetry('There has been an unexpected error, please try again.'));
				this.iframeLoading = false;
				this.checkoutAnalyticsService.TrackServerError(error.error);
			});
	}

	private postAllHppResponse(event, orderId, message) {
		if (event.data) {
			// pass the event data with all html tag removed
			const hppString = event.data.replace(/(<([^>]+)>)/gi, ' ');
			this.postHPPResponse(hppString, orderId);
		} else {
			this.postHPPResponse(message, orderId);
		}
	}

	private requestIframe() {
		const form = <HTMLFormElement>document.getElementById('realex_config');
		form.setAttribute('target', this.options.RealexModel.IframeId);

		const nua = navigator.userAgent.toLowerCase();
		// Check if Android Device, if browser is applewebkit and NOT chrome,
		// DE7324, native android browser use chrome as user agent, so replace with vendor check
		const is_android =
			nua.includes('mozilla/5.0') && nua.includes('android') && nua.includes('applewebkit') && navigator.vendor.indexOf('Google') === 0;
		// replace the submit url if old android device detected
		if (is_android) {
			// Use Older Realex URL
			form.setAttribute('action', this.options.RealexModel.PaymentGatewayUrlXdevice);
		}

		form.submit();
	}

	private submitRealexForm(data): Promise<void> {
		return new Promise((resolve, reject) => {
			// update options model
			this.store.dispatch(new paymentActions.UpdateRealexModel(data));
			setTimeout(() => {
				this.CreateIframe()
					.then(resolve)
					.catch(reject);
			}, 50);
		});
	}

	private beginSessionExpiryChecks(): void {
		clearTimeout(this.sessionExpiryTimer);

		this.checkIfSessionExpired();
	}

	private checkIfSessionExpired(): void {
		const now = new Date();

		if (now >= this.sessionExpiry) {
			this.httpService.get(`${this.apiUrls.ValidatePaymentPageUrl}&selectedItemsBitset=${this.bitSet}`, '', {}, true).subscribe(
				data => data,
				error => {
					// Don't retry if 500 error.
					if (error.status === 500) {
						// If an error occurs then set the error flag
						// and clear any existing timeouts so the server doesn't try again.
						this.errorOccured = true;
						clearTimeout(this.sessionExpiryTimer);

						this.store.dispatch(
							new errorActions.ShowErrorAction({
								errorCode: EErrorCode.SessionExpiry,
								hideCloseButton: true,
								reload: true,
							})
						);
					}
				}
			);
		}

		// If no error has occurred then set the new timeout to try again
		// if it has then don't set a new timeout.
		if (!this.errorOccured) {
			this.sessionExpiryTimer = setTimeout(this.checkIfSessionExpired.bind(this), 10000);
		}
	}
}
