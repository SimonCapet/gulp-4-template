import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { IStep, IGeneralContent, IJourneyContent } from 'ukbc/models';
import * as fromRoot from 'ukbc/reducers';
import { ViewportService } from 'ukbc/services';

@Component({
	selector: 'ukbc-header',
	templateUrl: './header.component.html',
})
export class HeaderComponent implements AfterViewInit {
	@Input() steps: IStep[];

	public Content$: Observable<IGeneralContent>;
	public JourneyContent$: Observable<IJourneyContent>;

	@ViewChild('racHeader') racHeader;

	constructor(public ElementRef: ElementRef, private store: Store<fromRoot.State>, private viewportService: ViewportService) {
		this.Content$ = store.select(fromRoot.getGeneralContent);
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
	}

	ngAfterViewInit() {
		this.viewportService.setRacHeaderPresent(true, this.racHeader.nativeElement.clientHeight);
	}

	public StripSpaces(input: string): string {
		return input.replace(/ /g, '');
	}
}
