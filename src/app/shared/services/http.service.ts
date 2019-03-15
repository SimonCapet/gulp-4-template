import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';

import { IHttpOptions } from 'shared/models';

@Injectable()
export class HttpService {
	private cache: {
		[params: string]: any;
	};

	private username: string;
	private password: string;

	constructor(private http: HttpClient) {
		this.cache = {};
	}

	public setCredentials(username: string, password: string): void {
		this.username = username;
		this.password = password;
	}

	public get(apiUrl: string, params: string = '', options: IHttpOptions = {}, fresh: boolean = false, timeout?: number): Observable<any> {
		const fromCache = this.cache[params];

		if (fromCache && !fresh) {
			return of(fromCache);
		}

		const url = `${apiUrl}${params}`;

		if (!options.headers) {
			options.headers = new HttpHeaders().set('Authorization', `Basic ${btoa(`${this.username}:${this.password}`)}`);
		}

		let request = this.http.get<any>(url, options);

		if (timeout) {
			request = request.timeout(timeout);
		}

		return request
			.map(data => {
				this.cache[params] = data;
				return data;
			})
			.catch(error => {
				return Observable.throw(error);
			});
	}

	public post(apiUrl: string, payload, options: IHttpOptions = {}, timeout?: number): Observable<any> {
		if (!options.headers) {
			options.headers = new HttpHeaders().set('Authorization', `Basic ${btoa(`${this.username}:${this.password}`)}`);
		}

		let request = this.http.post<any>(apiUrl, payload, options);

		if (timeout) {
			request = request.timeout(timeout);
		}

		return request.map(data => {
			return data;
		});
	}
}
