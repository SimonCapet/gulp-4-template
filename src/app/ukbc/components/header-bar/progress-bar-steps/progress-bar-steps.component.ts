import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IStep } from 'ukbc/models';

@Component({
	selector: 'ukbc-progress-bar-steps',
	templateUrl: './progress-bar-steps.component.html',
	styleUrls: ['./progress-bar-steps.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarStepsComponent {
	@Input() steps: IStep[];
}
