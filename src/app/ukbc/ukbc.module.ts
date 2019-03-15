import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { IInitialState } from 'ukbc/models';

import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import * as dialogActions from 'ukbc/actions/dialog.actions';

// Smart components
import { LayoutComponent } from 'ukbc/containers/layout/layout.component';
import { BasketComponent } from 'ukbc/containers/basket/basket.component';
import { QuestionsComponent } from 'ukbc/containers/questions/questions.component';
import { DetailsComponent } from 'ukbc/containers/details/details.component';
import { PaymentComponent } from 'ukbc/containers/payment/payment.component';
import { SectionCardComponent } from 'ukbc/containers/section-card/section-card.component';
import { DialogsComponent } from 'ukbc/containers/dialogs/dialogs.component';
import { DialogComponent } from 'ukbc/containers/dialogs/dialog.component';
import { ErrorComponent } from 'ukbc/components/error/error.component';
import { VSOEErrorComponent } from 'ukbc/components/error/vsoe-error.component';
import { ProductRemovedComponent } from 'ukbc/components/product-modals/product-removed.component';
import { ProductPreReqRequiredComponent } from 'ukbc/components/product-modals/product-pre-req-required.component';
import { VehicleRulesDialogComponent } from 'ukbc/components/product-modals/vehicle-rules-dialog.component';
import { SummaryComponent } from 'ukbc/containers/summary/summary.component';
import { FaqsComponent } from 'ukbc/components/faqs/faqs.component';

// Presentational components
import { ComponentsModule } from 'ukbc/components';

// Shared
import { SharedComponentsModule } from 'shared/components';
import { AddressService, HttpService, AnalyticsService, VehicleService } from 'shared/services';

// Route guards
import { StepGuard } from 'ukbc/services/step-guard.service';

// Services

import {
	ProductService,
	PricingService,
	ContentService,
	CoverService,
	PaymentService,
	CheckoutAnalyticsService,
	ViewportService,
	OfferService,
	SessionCamService,
	EagleEyeService,
} from 'ukbc/services';

// Interceptors
import { ErrorInterceptor } from 'ukbc/interceptors/error-interceptor';

import { CONFIG } from 'ukbc/config';
import { globalDataLayer } from 'ukbc/globalDataLayer';
(<any>window).globalDataLayer = globalDataLayer;

const initialState: IInitialState = (<any>window).UKBC_initialState;

// Pipes
import { PipesModule } from 'shared/pipes';
import { LoadingIndicatorComponent } from 'ukbc/components/loading/loading-indicator.component';
import { DetailsPaymentComponent } from 'ukbc/containers/checkout/details-payment.component';
import { EagleEyeHeaderComponent } from 'ukbc/containers/eagle-eye-token/eagle-eye-header.component';
import { EagleEyeInvalidDialogComponent } from 'ukbc/components/eagle-eye/eagle-eye-invalid-dialog.component';
import { ExchangeEagleEyeTokensDialogComponent } from 'ukbc/containers/eagle-eye-token/exchange-eagle-eye-tokens-dialog.component';
import { DirectDebitGuaranteeDialogComponent } from 'ukbc/components/payment/direct-debit-guarantee-dialog.component';
import { PurchaseTypeChangeRequiredComponent } from 'ukbc/components/product/disallowed-purchase-type/purchase-type-change-required.component';
import { ChangePurchaseTypeRemoveProductComponent } from 'ukbc/components/product/disallowed-purchase-type/change-purchase-type-remove-product.component';
import { PaymentFrequencyDialogComponent } from 'ukbc/components/payment-frequency/payment-frequency-dialog.component';

export const COMPONENTS = [
	LayoutComponent,
	QuestionsComponent,
	DetailsComponent,
	ProductRemovedComponent,
	ProductPreReqRequiredComponent,
	PurchaseTypeChangeRequiredComponent,
	VehicleRulesDialogComponent,
	ChangePurchaseTypeRemoveProductComponent,
	PaymentComponent,
	BasketComponent,
	SectionCardComponent,
	SummaryComponent,
	FaqsComponent,
	DialogsComponent,
	DialogComponent,
	ErrorComponent,
	VSOEErrorComponent,
	LoadingIndicatorComponent,
	DetailsPaymentComponent,
	EagleEyeHeaderComponent,
	EagleEyeInvalidDialogComponent,
	ExchangeEagleEyeTokensDialogComponent,
	DirectDebitGuaranteeDialogComponent,
	PaymentFrequencyDialogComponent,
];

const ErrorInterceptorProvider = {
	provide: HTTP_INTERCEPTORS,
	useClass: ErrorInterceptor,
	multi: true,
};

@NgModule({
	imports: [CommonModule, ComponentsModule, SharedComponentsModule, PipesModule, RouterModule.forChild([])],
	declarations: COMPONENTS,
	exports: COMPONENTS,
	entryComponents: COMPONENTS,
})
export class UkbcModule {
	constructor(
		private httpService: HttpService,
		private addressService: AddressService,
		private analyticsService: AnalyticsService,
		private vehicleService: VehicleService,
		private store: Store<fromRoot.State>
	) {
		this.httpService.setCredentials(CONFIG.RAC_API.USERNAME, CONFIG.RAC_API.PASSWORD);
		this.addressService.optionsUrl = initialState.ApiUrls.GetAddresses;
		this.addressService.detailsUrl = initialState.ApiUrls.GetAddress;
		this.addressService.timeout = initialState.ContentInformation.ErrorInfo.AddressTimeout;
		this.vehicleService.detailsUrl = initialState.ApiUrls.VehicleLookup;
		this.vehicleService.timeout = initialState.ContentInformation.ErrorInfo.VehicleTimeout;

		this.store.dispatch(
			new dialogActions.CreateDialogAction({
				id: 'error-message',
				component: ErrorComponent,
				open: false,
			})
		);

		this.store.dispatch(
			new dialogActions.CreateDialogAction({
				id: 'vsoe-error',
				component: VSOEErrorComponent,
				open: false,
			})
		);

		if (initialState.AppLoadWarningModalContent) {
			this.store.dispatch(
				new dialogActions.CreateDialogAction({
					id: 'load-warning',
					content: initialState.AppLoadWarningModalContent,
					open: true,
				})
			);
		}

		this.analyticsService.setTrackingPrefix(initialState.ContentInformation.Journey.AnalyticsPrefix);
	}

	static forRoot() {
		return {
			ngModule: UkbcModule,
			providers: [
				ProductService,
				PricingService,
				StepGuard,
				ContentService,
				CoverService,
				HttpService,
				AddressService,
				PaymentService,
				AnalyticsService,
				CheckoutAnalyticsService,
				VehicleService,
				ViewportService,
				DatePipe,
				DecimalPipe,
				OfferService,
				SessionCamService,
				EagleEyeService,
				ErrorInterceptorProvider,
			],
		};
	}
}
