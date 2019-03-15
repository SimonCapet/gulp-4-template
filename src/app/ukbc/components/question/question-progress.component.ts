import { Component, OnInit, OnDestroy, ElementRef, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import classNames from 'classnames';

import * as fromRoot from 'ukbc/reducers';

@Component({
	selector: 'app-question-progress',
	templateUrl: './question-progress.component.html',
	styleUrls: ['./question-progress.component.scss'],
})
export class QuestionProgressComponent implements OnInit, OnDestroy {
	@Input() title: string;

	public NumberOfQuestions: number;
	public CurrentActiveQuestion: number;
	public Classes: string;
	public IndicatorWidth: string;

	private subscriptions: Subscription[] = [];
	private initalised = false;
	private hidden = true;

	constructor(private store: Store<fromRoot.State>, public ElementRef: ElementRef) {}

	public ngOnInit(): void {
		this.subscribeToQuestions();
		this.subscribeToVisibility();

		setTimeout(() => {
			this.initalised = true;
			this.setClasses();
		});
	}

	public ngOnDestroy(): void {
		this.subscriptions.forEach(s => s.unsubscribe());
	}

	private subscribeToQuestions(): void {
		this.subscriptions.push(
			this.store.select(fromRoot.getAllQuestions).subscribe(questions => {
				const progressQuestions = questions.filter(q => !q.Hidden && !q.HideFromProgress);

				this.NumberOfQuestions = progressQuestions.length;

				const activeQuestion = progressQuestions.find(q => q.Active);

				this.CurrentActiveQuestion = progressQuestions.indexOf(activeQuestion) + 1;

				this.IndicatorWidth = `${this.CurrentActiveQuestion / this.NumberOfQuestions * 100}%`;
			})
		);
	}

	private subscribeToVisibility(): void {
		this.subscriptions.push(
			this.store.select(fromRoot.getQuestionsProgressHidden).subscribe(hidden => {
				this.hidden = hidden;
				this.setClasses();
			})
		);
	}

	private setClasses(): void {
		this.Classes = classNames({
			'QuestionProgress--hide': this.hidden,
			'QuestionProgress--initialised': this.initalised,
		});
	}
}
