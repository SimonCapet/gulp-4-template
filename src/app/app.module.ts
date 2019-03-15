import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import 'browser-has-hover';
import 'user-tabbing';

import { routes } from './routes';
import { reducers, metaReducers } from 'ukbc/reducers';

import { LayoutComponent } from 'ukbc/containers/layout/layout.component';
import { environment } from 'env/environment';

import { UkbcModule } from 'ukbc/ukbc.module';

import {
	ProductEffects,
	PaymentEffects,
	PricingEffects,
	ValidationEffects,
	ContactEffects,
	VehicleEffects,
	ErrorEffects,
	CoverEffects,
	QuestionEffects,
	StepEffects,
	CardEffects,
	EagleEyeEffects,
	InitEffects,
} from 'ukbc/effects';

import 'scripts/modules/add-client-classes';

import { DialogsComponent } from 'ukbc/containers/dialogs/dialogs.component';

@NgModule({
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,

		/**
		 * StoreModule.forRoot is imported once in the root module, accepting a reducer
		 * function or object map of reducer functions. If passed an object of
		 * reducers, combineReducers will be run creating your application
		 * meta-reducer. This returns all providers for an @ngrx/store
		 * based application.
		 */
		StoreModule.forRoot(reducers, { metaReducers }),

		RouterModule.forRoot(routes, { enableTracing: false, useHash: false, preloadingStrategy: PreloadAllModules }),

		/**
		 * Store devtools instrument the store retaining past versions of state
		 * and recalculating new states. This enables powerful time-travel
		 * debugging.
		 *
		 * To use the debugger, install the Redux Devtools extension for either
		 * Chrome or Firefox
		 *
		 * See: https://github.com/zalmoxisus/redux-devtools-extension
		 */
		!environment.production ? StoreDevtoolsModule.instrument() : [],

		/**
		 * EffectsModule.forRoot() is imported once in the root module and
		 * sets up the effects class to be initialized immediately when the
		 * application starts.
		 *
		 * See: https://github.com/ngrx/platform/blob/master/docs/effects/api.md#forroot
		 */
		EffectsModule.forRoot([
			ProductEffects,
			PaymentEffects,
			PricingEffects,
			ContactEffects,
			VehicleEffects,
			ValidationEffects,
			ErrorEffects,
			CoverEffects,
			QuestionEffects,
			StepEffects,
			CardEffects,
			EagleEyeEffects,
			InitEffects,
		]),
		UkbcModule.forRoot(),
	],
	bootstrap: [LayoutComponent, DialogsComponent],
})
export class AppModule {}
