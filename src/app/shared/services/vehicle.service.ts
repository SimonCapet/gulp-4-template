import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { HttpService } from 'shared/services/http.service';

@Injectable()
export class VehicleService {
	private _detailsUrl: string;
	private _timeout: number;

	constructor(private httpService: HttpService) {}

	set detailsUrl(url: string) {
		this._detailsUrl = url;
	}

	get detailsUrl() {
		if (!this._detailsUrl) {
			throw new Error('Details URL not specified in Vehicle Service');
		}
		return this._detailsUrl;
	}

	set timeout(timeout: number) {
		this._timeout = timeout;
	}

	get timeout(): number {
		return this._timeout;
	}

	public GetVehicleDetails(sVehicleReg: string) {
		return this.httpService.post(this.detailsUrl, { sVehicleReg }).toPromise();
	}
}
