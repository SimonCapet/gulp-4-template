import { Injectable } from '@angular/core';
import * as fromRoot from 'ukbc/reducers';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import { debounceTime, filter, map, take } from 'rxjs/operators';

export interface SessionCamObject {
	key: string;
	value: any;
}

@Injectable()
export class SessionCamService {
	constructor(private store$: Store<fromRoot.State>) {
		// Subscribe to marketing consent
		store$.select(fromRoot.getMarketingConsent).subscribe(marketingConsent => {
			const key = 'MarketingConsent';
			const value = marketingConsent;
			// Pass marketing consent setting to be sent to Session Cam
			this.sendSessionCamData({ key, value });
		});

		store$
			.select(fromRoot.getPrimaryMember)
			// Each field has an onChange listener, we don't want to send
			// each letter the user types to sessionCam, hence why we debounce.
			.pipe(debounceTime(500))
			.subscribe(primaryMember => {
				const key = 'PrimaryMemberData';
				// Build an object to contain the users details,
				// concatenate the first and last name.
				const value = {
					name: `${primaryMember.model.FirstName} ${primaryMember.model.LastName}`,
					email: primaryMember.model.Email,
					phoneNumber: primaryMember.model.PhoneNumber,
				};

				this.sendSessionCamData({ key, value });
			});

		// Un-comment for testing locally, adds the key being tested for after 500 millis.
		// setTimeout(() => {
		// 	window['sessionCamRecorder'] = true;
		// }, 500);
	}

	public sendSessionCamData(data: SessionCamObject): void {
		// Only let value through if it's true and take first value only.
		this.checkSessionCamExists()
			.pipe(filter(Boolean), take(1))
			.subscribe(exists => {
				// If we're here it means session cam is ready.
				// Check for session cam config keys, if not set then set them ourselves.
				if (!window['sessioncamConfiguration']) {
					window['sessioncamConfiguration'] = {};
					window['sessioncamConfiguration'].customDataObjects = [];
				}
				// Push latest change into customObjects. Session Cam will pick this up automatically and pass it through
				// as part of the session. Last value with key will be the final result of the session.
				window['sessioncamConfiguration'].customDataObjects.push(data);
			});
	}

	private checkSessionCamExists(): Observable<boolean> {
		// Check if session cam ready every 100 milliseconds and return boolean
		return Observable.interval(100).pipe(map(data => !!window['sessionCamRecorder']));
	}
}
