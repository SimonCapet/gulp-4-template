import { Component, Output, Input, EventEmitter, ViewEncapsulation, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import classNames from 'classnames';
import { IGeneralContent } from 'ukbc/models';

@Component({
	selector: 'ukbc-direct-debit-terms',
	templateUrl: './direct-debit-terms.component.html',
	styleUrls: ['./direct-debit-terms.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectDebitTermsComponent {
	@Input() agreeToDirectDebitTerms: boolean;
	@Input() content: IGeneralContent;
	@Input() forceShowValidationErrors = false;

	constructor(private ElementRef: ElementRef) {}
}
