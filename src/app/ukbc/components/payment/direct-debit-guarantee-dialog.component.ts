import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'ukbc-direct-debit-guarantee-dialog',
	templateUrl: './direct-debit-guarantee-dialog.component.html',
	styleUrls: ['./direct-debit-guarantee-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class DirectDebitGuaranteeDialogComponent {
	@Input() content: string;
	@Input() printLinkLabel: string;
	@Input() setOnClose: Function;

	public PrintPage() {
		window.print();
	}
}
