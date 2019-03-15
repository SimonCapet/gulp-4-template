import { ScrollTo } from 'scroll-to-position';
// import { getAllSiblings } from 'scripts/utils'; !This import was not being used in front-end!

export default class FAQs {
	private faqWrapper: HTMLElement;
	private faqs: HTMLElement[];
	private faqQuestions: HTMLElement[];
	private openClass: string;
	private viewportWidth: number;

	constructor(elem: HTMLElement) {
		this.faqs = [].slice.call(document.querySelectorAll('.FAQ'));
		this.faqQuestions = [].slice.call(document.querySelectorAll('.FAQ__question'));
		this.faqWrapper = <HTMLElement>document.querySelector('.FAQ__wrapper');
		this.openClass = 'FAQ--open';

		this.init();
	}

	private init(): void {
		window.addEventListener('resize', this.setViewportWidth.bind(this));
		this.setViewportWidth();

		this.faqQuestions.forEach(faqQuestion => faqQuestion.addEventListener('click', this.toggleFAQ.bind(this)));
	}

	private toggleFAQ(event: Event): void {
		const question = <HTMLElement>event.target;
		const faq = <HTMLElement>question.closest('.FAQ');

		if (faq.classList.contains(this.openClass)) {
			this.closeFAQ(faq);
		} else {
			this.openFAQ(faq);
		}
	}

	private openFAQ(faq: HTMLElement): void {
		const answer = <HTMLElement>faq.querySelector('.FAQ__answer');
		const answerInner = <HTMLElement>answer.querySelector('.FAQ__answer-inner');
		const currentlyOpenFaq = <HTMLElement>document.querySelector('.FAQ--open');

		if (currentlyOpenFaq) {
			this.closeFAQ(currentlyOpenFaq);
		}

		if (this.viewportWidth < 768) {
			setTimeout(() => ScrollTo([0, this.getTopOffset(faq) - 80]), 500);
		}

		faq.classList.add(this.openClass);
		answer.style.height = `${answerInner.offsetHeight}px`;
	}

	private closeFAQ(faq: HTMLElement): void {
		const answer = <HTMLElement>faq.querySelector('.FAQ__answer');

		faq.classList.remove(this.openClass);
		answer.style.height = '0';
	}

	private setViewportWidth(): void {
		this.viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}

	private getTopOffset(elem): number {
		const box = elem.getBoundingClientRect();

		const body = document.body;
		const docEl = document.documentElement;

		const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;

		const clientTop = docEl.clientTop || body.clientTop || 0;

		const top = box.top + scrollTop - clientTop;

		return Math.round(top);
	}
}
