import { IChatNowConfig } from 'shared/models';

const template = require('../../static-templates/_chat-now-button.pug');
const SCRIPT_ID = 'whos-on-script';
const BASE_CLASS = 'ChatNow';
const HIDE_CLASS = `${BASE_CLASS}--hide`;

export default class ChatNow {
	private config: IChatNowConfig;
	private button: HTMLLinkElement;

	constructor(private chatNow: HTMLElement) {
		this.config = JSON.parse(this.chatNow.dataset.config);

		if (this.config.ShowLiveChatPopOut) {
			this.loadWhosOn();
		}
	}

	private loadWhosOn(): void {
		if (!document.getElementById(SCRIPT_ID)) {
			const script = document.createElement('script');
			script.id = SCRIPT_ID;
			script.src = this.config.WhosOnURL;
			document.body.appendChild(script);

			script.onload = () => {
				if (typeof (<any>window).sWOTrackPage === 'function') {
					(<any>window).sWOTrackPage();

					this.renderButton();
				}
			};
		}
	}

	private renderButton(): void {
		this.button = <HTMLLinkElement>document.getElementById('whoson_chat_link');

		if (this.button) {
			this.button.className = `${BASE_CLASS} ${HIDE_CLASS}`;
			this.button.innerHTML = template({ text: this.config.ToggleButtonText });

			setTimeout(() => {
				this.show();
				(<any>window).showLiveChat = this.show.bind(this);
				(<any>window).hideLiveChat = this.hide.bind(this);
			}, 200);
		}
	}

	private show(): void {
		this.button.classList.remove(HIDE_CLASS);
	}

	private hide(): void {
		this.button.classList.add(HIDE_CLASS);
	}
}
