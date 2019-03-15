import { ScrollTo } from 'scroll-to-position';

export default class TrustpilotReviews {
	private children: Array<HTMLElement>;
	private currentIndex = 0;
	private container: HTMLElement;
	private showMoreButton: HTMLElement;
	private topMask: HTMLElement;
	private bottomMask: HTMLElement;

	constructor(private context: HTMLElement) {
		this.container = <HTMLElement>context.querySelector('.Trustpilot__reviews-container');
		this.children = Array.prototype.slice.call(context.querySelectorAll('.TrustpilotReview'));
		this.showMoreButton = <HTMLElement>context.querySelector('.Trustpilot__show-more');
		this.topMask = <HTMLElement>context.querySelector('.Trustpilot__reviews-mask-top');
		this.bottomMask = <HTMLElement>context.querySelector('.Trustpilot__reviews-mask-bottom');

		this.showMoreButton.addEventListener('click', this.showNext.bind(this));
	}

	private showNext(): void {
		if (this.currentIndex + 1 === this.children.length) {
			return;
		}
		this.currentIndex += 1;
		ScrollTo(this.children[this.currentIndex], { offset: [0, -this.children[0].offsetTop], scrollContainer: this.container });

		if (this.isFinalCardInView()) {
			this.bottomMask.classList.add('Trustpilot__reviews-mask--complete');
			this.showMoreButton.classList.add('Trustpilot__show-more--complete');
		}

		setTimeout(() => {
			if (this.isCardCutOffAtTop()) {
				this.topMask.classList.remove('Trustpilot__reviews-mask--complete');
			} else {
				this.topMask.classList.add('Trustpilot__reviews-mask--complete');
			}
		}, 100);
	}

	private isFinalCardInView(): boolean {
		const finalCardRectangle = this.children[this.children.length - 1].getBoundingClientRect();
		const containerRectangle = this.container.getBoundingClientRect();
		return this.currentIndex + 1 >= this.children.length || finalCardRectangle.top <= containerRectangle.bottom;
	}

	private isCardCutOffAtTop(): boolean {
		const containerRectangle = this.container.getBoundingClientRect();
		const cutOffCard = this.children.find(c => {
			const rectangle = c.getBoundingClientRect();
			return rectangle.top < containerRectangle.top && rectangle.bottom > containerRectangle.top;
		});
		return cutOffCard != null;
	}
}
