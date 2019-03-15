import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	ChangeDetectionStrategy,
	AfterViewInit,
	ViewEncapsulation,
	ViewChild,
	ElementRef,
} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import { IPayment, IPaymentOptions, IRetry, IRealexModel, IGeneralContent } from 'ukbc/models';
import { EPaymentType, EDirectDebitPaymentType, EPaymentCardType, ESaveCoverSource } from 'ukbc/enums';
import * as fromRoot from 'ukbc/reducers';
import { PaymentService, CoverService } from 'ukbc/services';
import * as paymentActions from 'ukbc/actions/payment.actions';
import { SectionCardComponent } from 'ukbc/containers/section-card/section-card.component';

import { IValidated } from 'shared/models/validation.model';
import { debounce } from 'scripts/utils';

@Component({
	selector: 'ukbc-payment-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCardComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() content: IGeneralContent;
	@Input() isOpen: boolean;
	@Input() paymentDetails: IValidated<IPayment>;
	@Input() options: IPaymentOptions;
	@Input() cardPaymentCard: SectionCardComponent;
	@ViewChild('iframeContainer') iframeContainer: ElementRef;

	private realexModel$: Observable<IRealexModel>;
	public Retry$: Observable<IRetry>;
	private realexModel: IRealexModel;
	private isRetry: Boolean;

	private subscriptions: Subscription[] = [];

	public PaymentType = EPaymentType;
	public DirectDebitPaymentType = EDirectDebitPaymentType;
	public IframeLoading$: Observable<boolean>;

	// Needed to stop iframe loading when it should show retry message
	private debouncedUpdateIframe: Function = debounce(this.updateIframe.bind(this), 100);

	constructor(private store: Store<fromRoot.State>, private paymentService: PaymentService, private coverService: CoverService) {
		this.realexModel$ = this.store.select(fromRoot.getRealexModel);
		this.Retry$ = store.select(fromRoot.getRetry);
		this.IframeLoading$ = this.store.select(fromRoot.getIframeLoading);
	}

	ngOnInit() {
		this.store.dispatch(new paymentActions.HideRealexRetry());

		this.subscriptions.push(
			this.realexModel$.withLatestFrom<IRealexModel, IRetry>(this.Retry$).subscribe(([model, retry]) => {
				this.isRetry = retry.show;
				this.debouncedUpdateIframe(model, retry);
			})
		);

		this.subscriptions.push(
			this.Retry$.withLatestFrom<IRetry, IRealexModel>(this.realexModel$).subscribe(([retry, model]) => {
				this.isRetry = retry.show;
				this.debouncedUpdateIframe(model, retry);
			})
		);

		if (!this.realexModel) {
			this.coverService.SaveCover(ESaveCoverSource.OnRefresh, EPaymentCardType.CardPayment);
		}
	}

	private updateIframe(model: IRealexModel, retry: IRetry) {
		if (model) {
			// Start logging iFrame load time from here.
			this.paymentService.logIframeLoadTime();
			if (!retry.show) {
				this.paymentService.CreateIframe().then(() => {
					if (this.iframeContainer.nativeElement) {
						setTimeout(() => this.cardPaymentCard.ScrollTo(this.iframeContainer), 0);
					}
				});
			}
		} else {
			this.paymentService.RemoveIframe();
		}
	}

	ngAfterViewInit() {
		if (this.cardPaymentCard) {
			setTimeout(() => this.cardPaymentCard.ScrollTo(), 0);
		}
	}

	public ShowDirectDebitCards() {
		return !this.content.HideDDCardSelection && this.paymentDetails.model.paymentType === this.PaymentType.DirectDebit;
	}

	ngOnDestroy() {
		if (this.isRetry) {
			this.paymentService.ResetRealexModel();
		}
		this.subscriptions.forEach(s => s.unsubscribe());
		this.subscriptions = [];
		this.paymentService.RemoveIframe();
	}

	public SetDirectDebitPaymentMethod(paymentMethod: EDirectDebitPaymentType) {
		this.store.dispatch(new paymentActions.HideRealexRetry());

		this.store.dispatch(
			new paymentActions.SetDirectDebitPaymentMethodAction({
				paymentType: EPaymentType.DirectDebit,
				directDebitPaymentType: paymentMethod,
			})
		);
	}

	public TryAgain() {
		this.paymentService.RetryRealexPayment().then(() => {
			if (this.iframeContainer.nativeElement) {
				setTimeout(() => this.cardPaymentCard.ScrollTo(this.iframeContainer), 0);
			}
		});
	}
}
