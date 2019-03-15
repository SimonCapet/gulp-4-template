import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { IProduct } from 'ukbc/models';
interface ProductResponse {
	results: IProduct;
}

@Injectable()
export class ProductService {
	constructor(private http: HttpClient) {}

	getProduct(): Observable<any> {
		return this.http.get<ProductResponse>('api/product');
	}
}
