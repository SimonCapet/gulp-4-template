import { Component, Input } from '@angular/core';

@Component({
	selector: 'ukbc-step-title',
	templateUrl: './title.component.html',
	styleUrls: ['./title.component.scss'],
})
export class StepTitleComponent {
	@Input() title: string;
	@Input() subtitle: string;
}
