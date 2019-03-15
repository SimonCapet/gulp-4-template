import { Injectable } from '@angular/core';
const mergeWith = require('lodash/mergeWith');

function mergeWithCustomiser(objValue, srcValue) {
	if (Array.isArray(srcValue)) {
		return srcValue.length ? srcValue : [];
	}
}
@Injectable()
export class AnalyticsService {
	private trackingPrefix: string;

	public trackEvent(eventName: String, payload?: Object) {
		const triggerEvent = (<any>window).Bootstrapper ? (<any>window).Bootstrapper.ensEvent.trigger : undefined;
		const newDataLayer = mergeWith((<any>window).globalDataLayer || {}, { ...payload }, mergeWithCustomiser);
		(<any>window).globalDataLayer = newDataLayer;
		if (triggerEvent && typeof triggerEvent === 'function') {
			triggerEvent(eventName, payload);
		}
	}

	public updateDataLayer(payload: Object): void {
		const newDataLayer = mergeWith((<any>window).globalDataLayer || {}, payload, mergeWithCustomiser);
		(<any>window).globalDataLayer = newDataLayer;
	}

	public setTrackingPrefix(prefix: string): void {
		this.trackingPrefix = prefix;
	}

	public trackFormFieldFocused(fieldName: string): void {
		this.trackEvent(`${this.trackingPrefix}_FormFieldClicked`, { fieldName });
	}

	public trackFormFieldError(fieldName: string, fieldNameError: string): void {
		this.trackEvent(`${this.trackingPrefix}_FormFieldError`, { fieldName, fieldNameError });
	}
}
