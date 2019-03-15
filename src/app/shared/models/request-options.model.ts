import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface IHttpOptions {
	headers?: HttpHeaders;
	observe?: 'body';
	params?: HttpParams;
	reportProgress?: boolean;
	responseType?: 'json';
	withCredentials?: boolean;
}
