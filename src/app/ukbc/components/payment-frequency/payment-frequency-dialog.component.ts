import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'ukbc-payment-frequency-dialog',
	templateUrl: './payment-frequency-dialog.component.html',
	styleUrls: ['./payment-frequency-dialog.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class PaymentFrequencyDialogComponent {
	@Input() content: string;
	@Input() printLinkLabel: string;
	@Input() setOnClose: Function;

	public PrintPage() {
		window.print();
	}
}
