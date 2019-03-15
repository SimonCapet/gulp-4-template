import { Component, ViewChild, ElementRef, Input, OnInit, OnChanges } from '@angular/core';
import { IStep } from 'ukbc/models';
import { filter, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ukbc-chat-now',
	templateUrl: './chat-now.component.html',
})
export class ChatNowComponent implements OnInit, OnChanges {
	@Input() config: JSON;
	@Input() currentStep: IStep;
	@Input() isLoading: boolean;

	public Config: string;
	public ShowLiveChat: boolean;

	ngOnInit() {
		this.Config = JSON.stringify(this.config);
		if ((<any>window).InitialiseComponents) {
			(<any>window).InitialiseComponents();
		}
	}

	ngOnChanges() {
		if (this.currentStep) {
			this.ShowLiveChat = this.currentStep.data.ShowLiveChat;
		}
		// Wait until global live chat variable is available before hiding or showing live chat.
		this.checkLiveChatExists()
			.pipe(filter(Boolean), take(1))
			.subscribe(exists => {
				if (!this.ShowLiveChat || this.isLoading) {
					(<any>window).hideLiveChat();
				} else {
					(<any>window).showLiveChat();
				}
			});
	}

	private checkLiveChatExists(): Observable<boolean> {
		// Check if live chat ready every 100 milliseconds and return boolean
		return Observable.interval(100).pipe(map(data => !!window['hideLiveChat']));
	}
}
