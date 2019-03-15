import {
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ChangeDetectionStrategy,
	ViewEncapsulation,
	SimpleChange,
	ViewChild,
	ElementRef,
	OnInit,
	OnDestroy,
} from '@angular/core';
import { Store } from '@ngrx/store';
import classNames from 'classnames';
import { ScrollTo } from 'scroll-to-position';

import { IQuestionState, IProductPrices, IProductBasisValues, IStep, IJourneyContent } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';
import * as questionActions from 'ukbc/actions/question.actions';
import * as productActions from 'ukbc/actions/product.actions';
import * as dialogActions from 'ukbc/actions/dialog.actions';

import { arrayContainsArray, arraysShareItem } from 'scripts/utils';
import { GetViewportDetails } from 'viewport-details';
import { EProductSelectionSource, EBaseProductPrefix, EPriceType } from 'ukbc/enums';
import { CheckoutAnalyticsService, OfferService } from 'ukbc/services';
import { toPounds } from 'shared/helpers';
import { Subscription } from 'rxjs/Subscription';
import { getProductRelatedContent } from 'ukbc/helpers/getProductRelatedContent.helper';
@Component({
	selector: 'app-question',
	templateUrl: './question.component.html',
	styleUrls: ['./question.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class QuestionComponent implements OnInit, OnChanges, OnDestroy {
	@Input() question: IQuestionState;
	@Input() index: number;
	@Input() selectedProductCodes: string[];
	@Input() productPrices: IProductPrices;
	@Input() comparisonProductPrices: IProductPrices;
	@Input() basisProductCodes: string[];
	@Input() basisValues: IProductBasisValues;
	@Input() userScrolling: boolean;
	@Input() scrollOffset: number;
	@Input() currentStep: IStep;
	@Input() addProductButtonCostSuffix: string;
	@Input() journeyContent: IJourneyContent;

	@ViewChild('context') context: ElementRef;

	public Classes: string;
	public YesButtonCssClass: string;
	public YesButtonText: string;
	public NoButtonCssClass: string;
	public NoButtonText: string;
	public Price: string;
	public ComparisonPrice: string;
	public BasisValue: number;
	public BasisMin: number;
	public BasisMax: number;
	public BasisLabel: string;
	public Offer: { offerMessage: string; backgroundColour: string | null };

	private subscriptions: Subscription[] = [];
	private basisType: EBaseProductPrefix;

	constructor(
		private store: Store<fromRoot.State>,
		private analyticsService: CheckoutAnalyticsService,
		private offerService: OfferService
	) {}

	public ngOnInit(): void {
		this.subscriptions.push(this.store.select(fromRoot.getCoverBasisType).subscribe(t => (this.basisType = t)));
	}

	public ngOnDestroy(): void {
		this.subscriptions.forEach(s => s.unsubscribe());
	}

	public ngOnChanges(changes: SimpleChanges): void {
		this.setClasses(changes.question, changes.userScrolling);
		this.setYesButton(changes.question, changes.selectedProductCodes);
		this.setNoButton(changes.question, changes.selectedProductCodes);
		this.setOfferBanner(changes.selectedProductCodes);
		this.setPrice(changes.productPrices);
		this.setBasisLabel(changes.productPrices);
		this.createDialog(changes.question);
		this.onActivate(changes.question, changes.currentStep);
		this.onStepChanges(changes.currentStep);
	}

	public OpenDialog(): void {
		this.store.dispatch(new dialogActions.OpenDialogAction({ id: this.dialogId }));

		this.analyticsService.TrackEvent('QuestionTellMore', { questionText: this.question.Title });
	}

	public YesClick(): void {
		if (this.question.YesButtonProductsToAdd.length) {
			this.store.dispatch(
				new productActions.BeginSelectProductAction({
					productCodes: this.question.YesButtonProductsToAdd,
					source: EProductSelectionSource.Questions,
					questionId: this.question.Id,
				})
			);
		} else {
			this.store.dispatch(new questionActions.AnswerQuestion(this.question.Id));
		}
	}

	public NoClick(): void {
		if (this.question.NoButtonProductsToRemove.length) {
			this.store.dispatch(
				new productActions.BeginDeselectProductAction({
					productCodes: this.question.NoButtonProductsToRemove,
					source: EProductSelectionSource.Questions,
					questionId: this.question.Id,
				})
			);
		} else {
			this.store.dispatch(new questionActions.AnswerQuestion(this.question.Id));
		}
	}

	private setClasses(questionChanges: SimpleChange, scrollChanges: SimpleChange): void {
		if (
			this.questionAnsweredChanged(questionChanges) ||
			this.questionActiveChanged(questionChanges) ||
			(scrollChanges && scrollChanges.previousValue !== scrollChanges.currentValue)
		) {
			this.Classes = classNames({
				'Question--active': this.question.Active,
				'Question--answered': this.question.Answered,
				'Question--scrolling': this.userScrolling && this.question.Answered,
				[`Question--${this.index}`]: true,
			});
		}
	}

	private questionAnsweredChanged(questionChanges: SimpleChange): boolean {
		return (
			questionChanges &&
			(!questionChanges.previousValue || questionChanges.previousValue.Answered !== questionChanges.currentValue.Answered)
		);
	}

	private questionActiveChanged(questionChanges: SimpleChange): boolean {
		return (
			questionChanges && (!questionChanges.previousValue || questionChanges.previousValue.Active !== questionChanges.currentValue.Active)
		);
	}

	private selectedProductsChanges(selectedProductChanges: SimpleChange): boolean {
		return (
			selectedProductChanges &&
			(!selectedProductChanges.previousValue ||
				selectedProductChanges.previousValue.join('') !== selectedProductChanges.currentValue.join(''))
		);
	}

	private buttonProductsAreSelected(buttonProducts: string[]): boolean {
		return (
			arrayContainsArray(this.selectedProductCodes, buttonProducts) ||
			(arraysShareItem(this.basisProductCodes, buttonProducts) && arraysShareItem(this.selectedProductCodes, this.basisProductCodes))
		);
	}

	private setYesButton(questionChanges: SimpleChange, selectedProductChanges: SimpleChange): void {
		if (this.questionAnsweredChanged(questionChanges) || this.selectedProductsChanges(selectedProductChanges)) {
			this.YesButtonText = this.question.YesButtonText;

			if (this.question.YesButtonCssClass) {
				this.YesButtonCssClass = this.question.YesButtonCssClass;
			} else if (
				this.question.Answered &&
				this.question.YesButtonProductsToAdd.length &&
				this.buttonProductsAreSelected(this.question.YesButtonProductsToAdd)
			) {
				this.YesButtonCssClass = 'Btn--added';

				if (this.question.YesButtonActiveText) {
					this.YesButtonText = this.question.YesButtonActiveText;
				}
			} else {
				this.YesButtonCssClass = 'Btn--add';
			}
		}
	}

	private setNoButton(questionChanges: SimpleChange, selectedProductChanges: SimpleChange): void {
		if (this.questionAnsweredChanged(questionChanges) || this.selectedProductsChanges(selectedProductChanges)) {
			this.NoButtonText = this.question.NoButtonText;

			if (this.question.NoButtonCssClass) {
				this.NoButtonCssClass = this.question.NoButtonCssClass;
			} else if (
				this.question.Answered &&
				this.question.NoButtonProductsToRemove.length &&
				!this.buttonProductsAreSelected(this.question.NoButtonProductsToRemove)
			) {
				this.NoButtonCssClass = 'Btn--removed';

				if (this.question.NoButtonActiveText) {
					this.NoButtonText = this.question.NoButtonActiveText;
				}
			} else {
				this.NoButtonCssClass = 'Btn--remove';
			}
		}
	}

	private onActivate(questionChanges: SimpleChange, currentStepChanges: SimpleChange): void {
		// If the active state changed, and the question became active but it has not been answered, attempt to scroll to the question.
		if (this.questionActiveChanged(questionChanges) && questionChanges.currentValue.Active && !questionChanges.currentValue.Answered) {
			// Have to setTimeout to wait for step changes to be populated.

			setTimeout(() => {
				this.ScrollIntoView();
			});
		}
	}

	private onStepChanges(currentStepChanges: SimpleChange): void {
		// If this is the first currentStep change (first page load), or if the current question is the first but not been answered
		// (session time out), scroll to question as browser will remember scroll position which may be further down the page, but the user
		// now has to answer all questions again.
		if (currentStepChanges && currentStepChanges.firstChange && this.question.Index === 0 && !this.question.Answered) {
			setTimeout(() => {
				ScrollTo([0, 0]);
			});
		}
	}

	public ScrollIntoView(): void {
		ScrollTo(this.context.nativeElement, {
			cancelOnUserScroll: false,
			offset: [0, -this.scrollOffset],
			duration: [500, 5000],
		}).then(() => {
			this.store.dispatch(new questionActions.EnableChangeQuestion());
		});
	}

	private setPrice(pricingChanges: SimpleChange): void {
		if (pricingChanges && (!pricingChanges.previousValue || pricingChanges.previousValue !== pricingChanges.currentValue)) {
			let price = 0;
			let comparisonPrice = 0;

			this.question.YesButtonProductsToAdd.forEach(productCode => {
				const productPrice = this.productPrices[productCode];
				const comparisonProductPrice = this.comparisonProductPrices ? this.comparisonProductPrices[productCode] : null;

				if (productPrice) {
					price += productPrice.Diff;
					comparisonPrice +=
						comparisonProductPrice != null && comparisonProductPrice.Diff != null && comparisonProductPrice.Diff > productPrice.Diff
							? comparisonProductPrice.Diff
							: productPrice.Diff;
				}
			});

			this.Price = toPounds(price);
			this.ComparisonPrice = toPounds(comparisonPrice);
		}
	}

	public SetBasis(amount: number): void {
		this.store.dispatch(
			new productActions.BeginSelectProductAction({
				productCodes: [`${this.question.BasisParentProductCode}${amount}`],
				source: EProductSelectionSource.Questions,
			})
		);
	}

	private setBasisLabel(pricingChanges: SimpleChange): void {
		if (this.question.IsBasis && pricingChanges && !pricingChanges.firstChange) {
			const selectedBaseProduct = this.selectedProductCodes.find(p => p.indexOf(this.question.BasisParentProductCode) > -1);
			const selectedBaseProductIndex = parseInt(selectedBaseProduct.replace(this.question.BasisParentProductCode, ''), 10);
			const nextBaseProductIndex = selectedBaseProductIndex + 1;
			const nextBaseProduct = `${this.question.BasisParentProductCode + nextBaseProductIndex}`;
			// Calculates the additional amount for an extra person/vehicle
			const additionalValue =
				nextBaseProductIndex <= this.basisValues.Max
					? this.productPrices[`${nextBaseProduct}`].Diff - this.productPrices[`${selectedBaseProduct}`].Diff
					: '';
			// If there is an additional value print it, otherwise print an empty string
			this.BasisLabel = additionalValue
				? this.question.BasisNumberLabel.replace('{price}', `<strong class="Question__basis-price">${toPounds(additionalValue)}</strong>`)
				: '';
		}
	}

	public get VerticalCentre(): number {
		const boundingRect = this.context.nativeElement.getBoundingClientRect();

		return boundingRect.top + boundingRect.height / 2 + GetViewportDetails().scrollY;
	}

	private get dialogId(): string {
		return `question-${this.question.Id}-info`;
	}

	private createDialog(changes: SimpleChange): void {
		if (changes && !changes.previousValue && this.question.ModalContent) {
			this.store.dispatch(
				new dialogActions.CreateDialogAction({
					id: this.dialogId,
					content:
						this.basisType === EBaseProductPrefix.PBM
							? getProductRelatedContent(this.question.ModalContent, EBaseProductPrefix.VBM)
							: getProductRelatedContent(this.question.ModalContent, EBaseProductPrefix.PBM),
					open: false,
				})
			);
		}
	}

	private setOfferBanner(selectedProductChanges: SimpleChange): void {
		this.Offer = null;

		const productCodes = this.question.YesButtonProductsToAdd;

		for (const productCode of productCodes) {
			const offer = this.offerService.GetProductOffer(productCode, this.selectedProductCodes.includes(productCode));

			if (offer) {
				this.Offer = offer;
				return;
			}
		}
	}
}
