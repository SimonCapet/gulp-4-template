import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { HttpService } from 'shared/services/http.service';
import { IAddressOption, IAddressDetail } from 'shared/models';

@Injectable()
export class AddressService {
	private _optionsUrl: string;
	private _detailsUrl: string;
	private _timeout: number;

	constructor(private httpService: HttpService) {}

	set optionsUrl(url: string) {
		this._optionsUrl = url;
	}

	get optionsUrl() {
		if (!this._optionsUrl) {
			throw new Error('Options URL not specified in Address Service');
		}
		return this._optionsUrl;
	}

	set detailsUrl(url: string) {
		this._detailsUrl = url;
	}

	set timeout(timeout: number) {
		this._timeout = timeout;
	}

	get detailsUrl() {
		if (!this._detailsUrl) {
			throw new Error('Details URL not specified in Address Service');
		}
		return this._detailsUrl;
	}

	get timeout() {
		return this._timeout;
	}

	public GetAddressOptions(sPostCode: string): Promise<any> {
		sPostCode = sPostCode.replace(/\s/g, '').toLowerCase();

		return this.httpService.post(this.optionsUrl, { sPostCode }, {}, this.timeout).toPromise();
	}

	public GetAddressDetails(sId: string): Promise<any> {
		return this.httpService.post(this.detailsUrl, { sId }, {}, this.timeout).toPromise();
	}
}
