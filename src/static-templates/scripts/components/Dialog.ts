import { PreventScrolling, ReEnableScrolling } from 'prevent-scrolling';

const template = require('../../render-components/_Dialog.pug');

const BASE_CLASS = `Dialog`;
const DISPLAY_CLASS = `${BASE_CLASS}--display`;
const OVERLAY_CLASS = `${BASE_CLASS}--overlay`;
const OPEN_CLASS = `${BASE_CLASS}--open`;
const ANIMATION_DURATION = 325;

export default class Dialog {
	// DOM Elements
	private context: HTMLElement;
	private dialog: HTMLDialogElement;
	private close: HTMLButtonElement;
	private inner: HTMLElement;

	constructor(context: HTMLElement, renderClose = true) {
		this.context = document.createElement('div');
		this.context.className = BASE_CLASS;

		this.context.innerHTML = template({ content: context.getAttribute('data-content'), renderClose });

		document.body.appendChild(this.context);

		this.dialog = <HTMLDialogElement>this.context.querySelector(`.${BASE_CLASS}__dialog`);
		this.close = <HTMLButtonElement>this.dialog.querySelector(`.${BASE_CLASS}__close`);
		this.inner = <HTMLElement>this.dialog.querySelector(`.${BASE_CLASS}__inner`);

		if (renderClose) {
			this.context.addEventListener('click', this.closeDialog.bind(this));
			this.close.addEventListener('click', this.closeDialog.bind(this));
		}

		const id = context.getAttribute('data-id');
		const triggers: HTMLElement[] = [].slice.call(document.querySelectorAll(`[data-dialog="${id}"]`));

		triggers.forEach(trigger => trigger.addEventListener('click', this.openDialog.bind(this)));
	}

	private openDialog(): void {
		this.context.classList.add(DISPLAY_CLASS);

		PreventScrolling(this.inner);

		setTimeout(() => {
			this.context.classList.add(OVERLAY_CLASS);
			this.dialog.setAttribute('open', 'true');

			setTimeout(() => {
				this.context.classList.add(OPEN_CLASS);
			}, ANIMATION_DURATION);
		}, 10);
	}

	private closeDialog(event?: Event): void {
		if (event.target === this.context || event.target === this.close) {
			this.context.classList.remove(OPEN_CLASS);

			setTimeout(() => {
				this.context.classList.remove(OVERLAY_CLASS);
				this.dialog.setAttribute('open', 'false');

				setTimeout(() => {
					this.context.classList.remove(DISPLAY_CLASS);

					ReEnableScrolling();
				}, ANIMATION_DURATION + 10);
			}, ANIMATION_DURATION);
		}
	}
}
