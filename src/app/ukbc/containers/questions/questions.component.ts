import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IViewportDetails } from 'viewport-details';

import * as fromRoot from 'ukbc/reducers';
import { ActivateQuestion } from 'ukbc/actions/question.actions';
import { ActivateNextStep, SetCurrentStepCompleted } from 'ukbc/actions/step.actions';
import { IQuestionState, IProductPrices, IProductBasisValues, IStep, IJourneyContent } from 'ukbc/models';
import { ViewportService } from 'ukbc/services';
import { QuestionComponent } from 'ukbc/components/question/question.component';
import { debounce } from 'scripts/utils/debounce.util';
import { ScrollTo } from 'scroll-to-position';
import { CONFIG } from 'ukbc/config';

const VERTICAL_RESIZE_THRESHOLD = 115;

@Component({
	selector: 'app-questions',
	templateUrl: './questions.component.html',
	styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent implements OnInit, OnDestroy {
	@ViewChildren(QuestionComponent) questions: QueryList<QuestionComponent>;

	public Questions$: Observable<IQuestionState[]>;
	public SelectedProductCodes$: Observable<string[]>;
	public ProductPrices$: Observable<IProductPrices>;
	public ComparisonProductPrices$: Observable<IProductPrices>;
	public BasisValues$: Observable<IProductBasisValues>;
	public BasisProductCodes$: Observable<string[]>;
	public SelectedBasisProductIndex$: Observable<string>;
	public StaticQuestions: IQuestionState[];
	public UserScrolling: boolean;
	public ScrollOffset$: Observable<number>;
	public CurrentStep$: Observable<IStep>;
	public NextStep$: Observable<IStep>;
	public AddProductButtonPriceSuffix$: Observable<string>;
	public JourneyContent$: Observable<IJourneyContent>;

	private subscriptions: Subscription[] = [];
	private viewportDetails: IViewportDetails;
	private canChangeQuestion: boolean;
	private initialised = false;
	private dialogOpen: boolean;

	private debouncedOnScrollEnd = debounce(this.onScrollEnd.bind(this), 500);
	private debouncedOnResize = debounce(this.onResize.bind(this), 100);

	constructor(private store: Store<fromRoot.State>, private viewportService: ViewportService) {
		this.Questions$ = store.select(fromRoot.getAllQuestions);
		this.SelectedProductCodes$ = store.select(fromRoot.getSelectedProductCodes);
		this.ProductPrices$ = store.select(fromRoot.getItemPrices);
		this.ComparisonProductPrices$ = store.select(fromRoot.getComparisonPrices);
		this.BasisValues$ = store.select(fromRoot.getBasisValues);
		this.BasisProductCodes$ = store.select(fromRoot.getBasisProductCodes);
		this.ScrollOffset$ = store.select(fromRoot.getScrollOffset);
		this.CurrentStep$ = store.select(fromRoot.getCurrentStep);
		this.NextStep$ = store.select(fromRoot.getNextStep);
		this.AddProductButtonPriceSuffix$ = store.select(fromRoot.getAddProductButtonPriceSuffix);
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
	}

	public ngOnInit(): void {
		this.subscribeToQuestions();
		this.subscribeToDialogs();

		setTimeout(() => {
			this.subscribeToViewportDetails();
		}, 10);
	}

	public ngOnDestroy(): void {
		this.subscriptions.forEach(s => s.unsubscribe());
	}

	private subscribeToQuestions(): void {
		this.Questions$.take(1).subscribe(questions => {
			this.StaticQuestions = questions;

			if (!questions.find(q => q.Active)) {
				setTimeout(() => {
					this.store.dispatch(new ActivateQuestion(questions[0].Id));
					ScrollTo([0, 0], { animate: false, cancelOnUserScroll: false }).then(() => (this.initialised = true));
				});
			} else {
				this.initialised = true;
			}
		});
		this.subscriptions.push(this.store.select(fromRoot.getCanChangeQuestion).subscribe(c => (this.canChangeQuestion = c)));
	}

	private subscribeToViewportDetails(): void {
		this.subscriptions.push(
			this.viewportService.ViewportDetails.subscribe(v => {
				this.viewportDetails = v;

				if (v.scrolled && !(<any>window).autoScrolling) {
					this.UserScrolling = true;
					this.debouncedOnScrollEnd();
				}

				// Only run debounced resize on vertical resizes over the threshold to prevent strange behaviour on iOS as browser controls animate away
				const heightHasChanged = Math.abs(v.height - v.previous.height) > VERTICAL_RESIZE_THRESHOLD;
				const widthHasChanged = v.width !== v.previous.width;
				if (v.orientationChanged || (v.resized && (heightHasChanged || widthHasChanged))) {
					// Don't run debounced resize on mobiles/tablets if only the height has changed to avoid triggering when a keyboard pops in
					const isMobileOrTableAndOnlyHeightHasChanged = v.width <= CONFIG.DESKTOP_BREAKPOINT && heightHasChanged && !widthHasChanged;
					if (!isMobileOrTableAndOnlyHeightHasChanged) {
						this.debouncedOnResize();
					}
				}
			})
		);
	}

	private subscribeToDialogs(): void {
		this.subscriptions.push(this.store.select(fromRoot.getIsDialogOpen).subscribe(open => (this.dialogOpen = open)));
	}

	private onScrollEnd(): void {
		if (this.canChangeQuestion && this.initialised && !this.dialogOpen) {
			const questionComponents = this.questions.toArray();
			const scrollCentre = this.viewportDetails.scrollY + this.viewportDetails.height / 2;

			let questionClosestToCentre: QuestionComponent;
			let closestDistance = 9999;

			questionComponents.forEach(q => {
				const distance = Math.abs(scrollCentre - q.VerticalCentre);

				if (distance < closestDistance) {
					closestDistance = distance;
					questionClosestToCentre = q;
				}
			});

			if (!questionClosestToCentre.question.Active) {
				const visibleQuestions = questionComponents.filter(q => !q.question.Hidden);
				if (
					questionClosestToCentre.question.Index === 0 ||
					visibleQuestions[visibleQuestions.indexOf(questionClosestToCentre) - 1].question.Answered
				) {
					this.store.dispatch(new ActivateQuestion(questionClosestToCentre.question.Id));
				} else {
					this.scrollToCurrentActiveQuestion();
				}
			}
		}

		this.UserScrolling = false;
	}

	private onResize(): void {
		this.scrollToCurrentActiveQuestion();
	}

	private scrollToCurrentActiveQuestion(): void {
		const activeQuestion = this.questions.toArray().find(q => q.question.Active);

		activeQuestion.ScrollIntoView();
	}

	public CanCompleteStep(): Observable<boolean> {
		// Basis questions are never answered; we rely on the fact that they will always be the last question
		return this.Questions$.map(questions => questions.every(question => question.Answered || question.Hidden || question.IsBasis));
	}

	public CompleteStep(): void {
		this.store.dispatch(new SetCurrentStepCompleted());
		this.store.dispatch(new ActivateNextStep());

		const id = this.questions.first.question.Id;

		setTimeout(() => {
			this.store.dispatch(new ActivateQuestion(this.questions.first.question.Id));
		}, 750);
	}
}
