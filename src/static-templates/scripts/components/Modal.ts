import { GetViewportDetails } from 'viewport-details';
import { PreventScrolling, ReEnableScrolling } from 'prevent-scrolling';

const CONFIG = {
	BACKDROP_TRANSITION_DURATION: 200,
};

export default class Modal {
	private triggers: HTMLElement[];
	private closeButton: HTMLElement;
	private _modalBackdrop: HTMLElement;
	private scrollableArea: HTMLElement;
	private id: string;
	private modalOpen = false;

	constructor(private modal: HTMLElement) {
		this.id = this.modal.getAttribute('data-modal');
		this.modalBackdrop.appendChild(modal);
		this.triggers = [].slice.call(document.querySelectorAll(`.Modal__trigger[data-modal='${this.id}']`));
		this.closeButton = <HTMLElement>this.modal.querySelector('.Modal__cross');
		this.scrollableArea = <HTMLElement>this.modal.querySelector('.Modal__inner');

		this.init();
	}

	private get modalBackdrop(): HTMLElement {
		if (!this._modalBackdrop) {
			this._modalBackdrop = <HTMLElement>document.querySelector('.Modals');
		}

		if (!this._modalBackdrop) {
			this._modalBackdrop = document.createElement('div');
			this._modalBackdrop.className = 'Modals Modals--hidden';
			document.body.appendChild(this._modalBackdrop);
		}

		return this._modalBackdrop;
	}

	private init(): void {
		this.modalBackdrop.addEventListener('click', this.closeModal.bind(this));

		this.modal.addEventListener('click', event => event.stopPropagation());

		this.triggers.forEach(trigger => trigger.addEventListener('click', this.openModal.bind(this)));

		this.closeButton.addEventListener('click', this.closeModal.bind(this));

		window.addEventListener(
			'keyup',
			event => {
				if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
					this.closeModal();
				}
			},
			true
		);
	}

	private openModal(): void {
		this.showBackdrop().then(() => {
			this.modal.setAttribute('open', '');
			setTimeout(() => this.modal.classList.add('Modal--open'), 10);
		});
	}

	private showBackdrop(): Promise<void> {
		return new Promise(resolve => {
			if (this.modalBackdrop.classList.contains('Modals--hidden')) {
				this.modalOpen = true;
				PreventScrolling(this.scrollableArea);
				this.scrollableArea.scrollTop = 0;
				this.scrollableArea.focus();

				this.setHeight(true);

				this.modalBackdrop.classList.remove('Modals--hidden');
				this.modalBackdrop.classList.remove('Modals--closing');

				setTimeout(() => {
					this.modalBackdrop.classList.add('Modals--visible');
					setTimeout(resolve, CONFIG.BACKDROP_TRANSITION_DURATION);
				}, 10);
			} else {
				resolve();
			}
		});
	}

	private closeModal(): void {
		this.modalBackdrop.classList.remove('Modals--visible');
		this.modalBackdrop.classList.add('Modals--closing');

		setTimeout(() => {
			this.modalOpen = false;
			this.modalBackdrop.classList.add('Modals--hidden');
			this.modal.classList.remove('Modal--open');
			this.modal.removeAttribute('open');

			ReEnableScrolling();
		}, CONFIG.BACKDROP_TRANSITION_DURATION);
	}

	private setHeight(firstRun?: boolean): void {
		if (this.modalOpen) {
			const viewport = GetViewportDetails();

			if (firstRun || viewport.resized) {
				const height = viewport.height;

				this.modalBackdrop.style.height = `${height}px`;
			}
			requestAnimationFrame(this.setHeight.bind(this));
		}
	}
}
