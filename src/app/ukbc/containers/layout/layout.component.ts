import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import classNames from 'classnames';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { GetViewportDetails } from 'viewport-details';

import * as fromRoot from 'ukbc/reducers';
import { SetShowValidationErrors } from 'ukbc/actions';
import * as stepActions from 'ukbc/actions/step.actions';
import * as layoutActions from 'ukbc/actions/layout.actions';

import { IStep, IGeneralContent, IJourneyContent } from 'ukbc/models';
import { ViewportService } from 'ukbc/services/viewport.service';
import { CONFIG } from 'ukbc/config';

// UKBC routes
import { routes } from 'ukbc/routes';
import { IsDowngrade } from 'ukbc/helpers';
import { HeaderComponent } from 'ukbc/components/header-bar/header/header.component';
import { BasketComponent } from 'ukbc/containers/basket/basket.component';
import { SavedStepState } from 'ukbc/reducers/step.reducer';
import { EStepType, EPurchaseType } from 'ukbc/enums';
import { ILoadingState } from 'ukbc/reducers/loading.reducer';
import { QuestionProgressComponent } from 'ukbc/components/question/question-progress.component';
import { ScrollTo } from 'scroll-to-position';
import { EagleEyeHeaderComponent } from 'ukbc/containers/eagle-eye-token/eagle-eye-header.component';
import { IChatNowConfig } from 'shared/models';

const MAIN_PADDING_TOP = 40;
@Component({
	selector: 'ukbc-layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('header') header: HeaderComponent;
	@ViewChild('questionProgress') questionProgress: QuestionProgressComponent;
	@ViewChild('basket') basket: BasketComponent;
	@ViewChild('eagleEye') eagleEye: EagleEyeHeaderComponent;

	private routerEvents: Subscription;
	private isFirstNavigation = true;
	private showLiveChat: boolean;
	private eagleEyeHeaderOffset = -90;
	private pricePrefix$: Observable<String>;
	private priceSuffix$: Observable<String>;
	private frequency$: Observable<EPurchaseType>;
	private basketUpdatesSubscriptions: Subscription[] = [];

	public Steps$: Observable<IStep[]>;
	public CurrentStep$: Observable<IStep>;
	public NextStep$: Observable<IStep>;
	public LiveChatContent: IChatNowConfig;
	public ShowLiveChat$: Observable<boolean>;
	public Content$: Observable<IGeneralContent>;
	public JourneyContent$: Observable<IJourneyContent>;
	public EStepType = EStepType;
	public LoadingState$: Observable<ILoadingState>;
	public DesktopMode = GetViewportDetails().width > CONFIG.MOBILE_BREAKPOINT;
	public LiveChatClass: string;
	public SomeDialogIsOpen: boolean;
	public ProgressTop: String = 'inherit';
	public ProgressOpacity: String = 'inherit';

	constructor(private store$: Store<fromRoot.State>, private router: Router, private viewportService: ViewportService) {
		this.Content$ = store$.select(fromRoot.getGeneralContent);
		this.frequency$ = store$.select(fromRoot.getFrequency);
		this.JourneyContent$ = store$.select(fromRoot.getJourneyContent);
		this.Steps$ = store$.select(fromRoot.getSteps);
		this.CurrentStep$ = store$.select(fromRoot.getCurrentStep);
		this.NextStep$ = store$.select(fromRoot.getNextStep);
		this.ShowLiveChat$ = store$.select(fromRoot.getShowLiveChat);
		this.LoadingState$ = store$.select(fromRoot.getLoadingState);
		this.pricePrefix$ = store$.select(fromRoot.getPricePrefix);
		this.priceSuffix$ = store$.select(fromRoot.getPriceSuffix);

		store$
			.select(fromRoot.getLiveChatContent)
			.subscribe(c => (this.LiveChatContent = c))
			.unsubscribe();

		store$.select(fromRoot.getDialogs).subscribe(dialogs => (this.SomeDialogIsOpen = dialogs.filter(d => d.open).length > 0));
	}

	public ngOnInit() {
		this.router.resetConfig(routes);
		this.subscribeToRouterEvents();
		this.subscribeToViewportDetails();
		this.subscribeToShowLiveChat();
		this.subscribeToBasketUpdates();
		this.handleDowngrade();
	}

	public ngAfterViewInit() {
		if (this.eagleEye) {
			this.viewportService.setEagleEyeHeaderPresent(true, this.eagleEyeHeaderOffset);
		}

		this.adjustStickyProgressBar();
	}

	ngOnDestroy() {
		this.basketUpdatesSubscriptions.forEach(subscription => {
			subscription.unsubscribe();
		});
	}

	private setProgressTop(): void {
		this.ProgressTop = this.basket ? `${this.basket.ElementRef.nativeElement.getBoundingClientRect().height}px` : 'inherit';
	}

	private subscribeToViewportDetails(): void {
		this.viewportService.ViewportDetails.subscribe(v => {
			this.DesktopMode = v.width > CONFIG.MOBILE_BREAKPOINT;

			if (v.resized) {
				this.adjustStickyProgressBar();
			}

			this.setLiveChatClass();
		});
	}

	private subscribeToShowLiveChat(): void {
		this.ShowLiveChat$.subscribe(show => {
			this.showLiveChat = show;
			this.setLiveChatClass();
		});
	}

	private subscribeToBasketUpdates(): void {
		this.basketUpdatesSubscriptions.push(
			this.CurrentStep$.subscribe(step => {
				this.adjustStickyProgressBar();
			})
		);

		this.basketUpdatesSubscriptions.push(
			this.frequency$.subscribe(value => {
				this.adjustStickyProgressBar();
			})
		);

		this.basketUpdatesSubscriptions.push(
			this.pricePrefix$.subscribe(value => {
				this.adjustStickyProgressBar();
			})
		);

		this.basketUpdatesSubscriptions.push(
			this.priceSuffix$.subscribe(value => {
				this.adjustStickyProgressBar();
			})
		);
	}

	private setScrollOffset(): void {
		let offset = 0;

		if (this.DesktopMode) {
			const eagleEyeHeight = this.eagleEye != null ? this.eagleEye.ElementRef.nativeElement.getBoundingClientRect().height : 0;
			offset = this.header.ElementRef.nativeElement.getBoundingClientRect().height + eagleEyeHeight + MAIN_PADDING_TOP;
		} else {
			const basketHeight = this.basket ? this.basket.ElementRef.nativeElement.getBoundingClientRect().height : 0;
			const questionHeight =
				this.questionProgress != null ? this.questionProgress.ElementRef.nativeElement.getBoundingClientRect().height : 0;
			offset = basketHeight + questionHeight;
		}

		this.store$.dispatch(new layoutActions.SetScrollOffset(offset));
	}

	private handleDowngrade(): void {
		if (IsDowngrade()) {
			const previousJourneyStep = SavedStepState.find(step => step.status.current);

			if (previousJourneyStep) {
				this.router.navigate([previousJourneyStep.url]);
			}

			sessionStorage.removeItem('downgrade');
		}
	}

	private subscribeToRouterEvents(): void {
		this.routerEvents = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.store$.dispatch(new SetShowValidationErrors(false));
				this.store$.dispatch(new stepActions.SetStepCurrent(event.urlAfterRedirects));
				if (!this.isFirstNavigation) {
					setTimeout(() => {
						// If first navigation then scroll the window to the top
						ScrollTo([0, 0], { animate: false });
					}, 0);
				}

				this.isFirstNavigation = false;
			}
		});
	}

	private setLiveChatClass(): void {
		this.LiveChatClass = classNames({
			'ChatNow__toggle-text--hidden': !this.DesktopMode || !this.showLiveChat,
		});
	}

	private adjustStickyProgressBar(): void {
		this.ProgressOpacity = '0';
		setTimeout(() => {
			this.setScrollOffset();
			this.setProgressTop();
			this.ProgressOpacity = '1';
		});
	}
}
