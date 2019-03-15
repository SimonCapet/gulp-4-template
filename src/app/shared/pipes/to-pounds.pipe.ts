import { Pipe, PipeTransform } from '@angular/core';
import { toPounds } from 'shared/helpers';

@Pipe({ name: 'toPounds' })
export class ToPoundsPipe implements PipeTransform {
	transform(price: null | number, zeroAsFree = true): string {
		return toPounds(price, zeroAsFree);
	}
}
