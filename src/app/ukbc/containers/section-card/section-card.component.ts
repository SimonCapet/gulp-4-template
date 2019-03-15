import { Component, Input, Output, ViewEncapsulation, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { ViewportService } from 'ukbc/services';
import classNames from 'classnames';
import { ICardStatus } from 'ukbc/models';
import { CardType } from 'ukbc/models/card.model';

@Component({
	selector: 'ukbc-section-card',
	templateUrl: './section-card.component.html',
	styleUrls: ['./section-card.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SectionCardComponent implements OnChanges {
	@Input() contentClass: string;
	@Input() type: CardType;
	@Input() title: string;
	@Input() hideTitleOnOpen: boolean;
	@Input() cardStatus: ICardStatus;

	@Output() ScrollTo = this.scrollTo;

	private scrollOffset = -45;
	private scrollDuration = 750;

	constructor(private elementRef: ElementRef, private viewportService: ViewportService) {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.cardStatus && !this.IsCardOpen(changes.cardStatus.previousValue) && this.IsCardOpen(changes.cardStatus.currentValue)) {
			setTimeout(() => this.scrollTo(), 0);
		}
	}

	private scrollTo(subElement: ElementRef = this.elementRef): void {
		this.viewportService.ScrollToElement(subElement.nativeElement, true, this.scrollDuration, this.scrollOffset);
	}

	public IsCardOpen(cardStatus: ICardStatus = this.cardStatus): boolean {
		return (
			cardStatus.openCardType &&
			cardStatus.openCardType === this.type &&
			!this.cardStatus.cards.find(card => card.type === this.type).readonly
		);
	}

	public IsCardCompleted(): boolean {
		return (
			this.cardStatus.cards.find(card => card.type === this.type).readonly ||
			!!this.cardStatus.completedCardTypes.find(type => type === this.type)
		);
	}

	public IsCardVisible(): boolean {
		const card = this.cardStatus.cards.find(c => c.type === this.type);
		return card && card.visible;
	}

	public get Classes(): string {
		return classNames('SectionCard', {
			'SectionCard--open': this.IsCardOpen(),
			'SectionCard--complete': !this.IsCardOpen() && this.IsCardCompleted(),
			'SectionCard--incomplete': !this.IsCardOpen() && !this.IsCardCompleted(),
		});
	}
}
