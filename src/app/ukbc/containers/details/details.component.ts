import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';

import * as fromRoot from 'ukbc/reducers';
import * as contactActions from 'ukbc/actions/contact.actions';
import * as addressActions from 'ukbc/actions/address.actions';
import * as cardActions from 'ukbc/actions/card.actions';
import { SetShowValidationErrors } from 'ukbc/actions';

import {
	IJourneyContent,
	IContactCardStatus,
	Contact,
	IInitialState,
	IStepSubtitles,
	IConsent,
	ICardStatus,
	ICard,
	IVehicles,
	IGeneralContent,
} from 'ukbc/models';
import { CoverService, ViewportService, CheckoutAnalyticsService } from 'ukbc/services';
import { SectionCardComponent } from 'ukbc/containers/section-card/section-card.component';

import { IValidated } from 'shared/models/validation.model';
import { IAddressState } from 'shared/models/address.model';
import { IAddress, IAddressFieldEventPayload } from 'shared/models';
import { EBaseProductPrefix, ECardCategory, EDetailsCardType, EPaymentCardType, ESaveCoverSource } from 'ukbc/enums';
import { CardType } from 'ukbc/models/card.model';
import { take } from 'rxjs/operators';

@Component({
	selector: 'ukbc-details',
	templateUrl: './details.component.html',
	styleUrls: ['./details.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent implements OnInit, OnDestroy {
	@ViewChild('membersCard') membersCard: SectionCardComponent;
	@ViewChild('addressCard') addressCard: SectionCardComponent;
	@ViewChild('vehiclesCard') vehiclesCard: SectionCardComponent;

	public PrimaryMember: IValidated<Contact>;

	public AdditionalMembers: IValidated<Contact>[];

	public CardStatus: ICardStatus;

	public ContactCardStatus: IContactCardStatus;

	public Address: IAddressState;

	private consent: IValidated<IConsent>;

	public VehiclesState: IVehicles;

	public Content$: Observable<IInitialState>;
	public GeneralContent$: Observable<IGeneralContent>;
	public StepTitle: string;
	public StepSubtitle: string;
	public StepSubtitles: IStepSubtitles;

	private vbmMembersCardTitle: string;
	private pbmMembersCardTitle: string;

	public JourneyContent: IJourneyContent;

	public CoreProduct: string;
	public additionalMemberQuestion: boolean;
	public additionalMembersAnswer: boolean;
	public HideMembersCompleteButton = false;

	public ForceShowValidationErrors$: Observable<boolean>;

	private subscriptions: Subscription[];

	public AddressLoading = false;
	public VehicleLoading = false;

	public CardType = EDetailsCardType;
	private cards: ICard[];
	private completedCards: string[];

	constructor(
		private store: Store<fromRoot.State>,
		private route: ActivatedRoute,
		private cd: ChangeDetectorRef,
		public cover: CoverService,
		private viewportService: ViewportService,
		private checkoutAnalyticsService: CheckoutAnalyticsService
	) {
		this.Content$ = store.select(fromRoot.getContent);
		this.GeneralContent$ = store.select(fromRoot.getGeneralContent);
		this.ForceShowValidationErrors$ = store.select(fromRoot.getForceShowValidationErrors);
		this.StepTitle = route.snapshot.data['title'];
		this.StepSubtitle = route.snapshot.data['subtitle'];
		this.StepSubtitles = route.snapshot.data['subtitles'];
		store
			.select(fromRoot.getCards)
			.pipe(take(1))
			.subscribe(cards => (this.cards = cards));

		store.select(fromRoot.getCompletedCards).subscribe(completedCards => (this.completedCards = completedCards));
	}

	ngOnInit() {
		// Add all subscriptions to an array making it easier to add more.
		this.subscriptions = [
			this.store.select(fromRoot.getPrimaryMember).subscribe(primaryMember => (this.PrimaryMember = primaryMember)),

			this.store.select(fromRoot.getAdditionalMembers).subscribe(additionalMembers => {
				this.AdditionalMembers = additionalMembers;
				this.cd.markForCheck();
			}),

			this.store.select(fromRoot.getAddress).subscribe(address => (this.Address = address)),

			this.store.select(fromRoot.getConsent).subscribe(consent => (this.consent = consent)),

			this.store.select(fromRoot.getVehiclesState).subscribe(state => {
				this.VehiclesState = state;
				this.cd.markForCheck();
			}),

			this.store.select(fromRoot.getCardStatus).subscribe(state => {
				this.CardStatus = state;
				// Only open the first card if it's not already completed.
				if (!state.openCardType && !state.completedCardTypes.find(type => type === EDetailsCardType.Members)) {
					this.store.dispatch(new cardActions.OpenCard(EDetailsCardType.Members));
				}

				this.cd.markForCheck();
			}),

			this.store.select(fromRoot.getContactCardState).subscribe(status => {
				this.ContactCardStatus = status;
				this.cd.markForCheck();
			}),

			this.Content$.subscribe(content => {
				this.JourneyContent = content.ContentInformation.Journey;
				this.CoreProduct = this.JourneyContent.CoreProductCode;
				this.additionalMemberQuestion = this.JourneyContent.AdditionalMembersQuestion;
				this.additionalMembersAnswer = this.JourneyContent.AdditionalMembersAnswer;
				this.pbmMembersCardTitle = content.ContentInformation.GeneralInfo.PbmMembersCardTitle;
				this.vbmMembersCardTitle = content.ContentInformation.GeneralInfo.VbmMembersCardTitle;

				// If there is an Additional members question then grab the additional answer from
				// local storage else get it from initial state.
				if (this.additionalMemberQuestion) {
					this.store
						.select(fromRoot.getAddAdditionalMembers)
						.take(1)
						.subscribe(addAdditionalMembers => {
							this.additionalMembersAnswer =
								typeof addAdditionalMembers !== 'undefined' ? addAdditionalMembers : this.additionalMembersAnswer;
							this.cd.markForCheck();
						});
					this.HideMembersCompleteButton = true;
				}
				this.cd.markForCheck();
			}),
		];

		if (this.CardStatus.openCardType && this.CardStatus.openCardType !== EDetailsCardType.Members) {
			const card = this.getCardElement(this.CardStatus.openCardType);

			if (card) {
				setTimeout(() => card.ScrollTo());
			}
		}
	}

	ngOnDestroy() {
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
	}

	private shouldAdditionalMembersCardBeVisible(): boolean {
		let showAdditionalMembers = true;
		let coreProduct;

		this.Content$.take(1).subscribe(content => {
			coreProduct = content.ContentInformation.Journey.CoreProductCode;
		});

		// If the core product is not LCP then check if we should show
		// additional members
		if (!coreProduct.includes(EBaseProductPrefix.LCP)) {
			this.store
				.select(fromRoot.getAdditionalMembers)
				.take(1)
				.subscribe((s: IValidated<Contact>[]) => (showAdditionalMembers = !!s.length));
		}
		return showAdditionalMembers;
	}

	public SetContactField(eventData: { contact: Contact; field: string; value: string }): void {
		// This is a fudge fix to prevent a validation issue as the iOS quote character may not be supported by Drive.
		// This should be investigated further and our validation Regexes relaxed.

		if (typeof eventData.value === 'string') {
			eventData.value = eventData.value.replace(/’/g, `'`);
		}

		this.store.dispatch(new contactActions.SetContactField(eventData));
	}

	public SetAddressField(eventData: IAddressFieldEventPayload): void {
		this.store.dispatch(new addressActions.SetAddressField(eventData));
	}

	public SetAddress(address: IAddress): void {
		this.store.dispatch(new addressActions.SetAddress(address));
	}

	public OnAddressManualEditToggle(isManuallyEditing: boolean): void {
		this.addressCard.ScrollTo();
		this.store.dispatch(new addressActions.SetManuallyEditAddress(isManuallyEditing));
	}

	public OnAddressChosen(): void {
		this.addressCard.ScrollTo();
		this.showValidationErrors(false);
		this.store.dispatch(new addressActions.SetAddressChosen(true));
	}

	public OnAddressLoading(loading: boolean): void {
		this.AddressLoading = loading;
	}

	public OnVehicleLoading(loading: boolean): void {
		this.VehicleLoading = loading;
	}

	private canOpenCard(typeToOpen: EDetailsCardType): boolean {
		return this.IsCardCompleted(typeToOpen);
	}

	public OpenCard(type) {
		this.checkoutAnalyticsService.TrackSectionEditClicked(type);
		if (this.canOpenCard(type)) {
			this.showValidationErrors(false);
			this.store.dispatch(new cardActions.OpenCard(type));
		} else {
			this.showValidationErrors(true);
		}
	}

	private getCardElement(cardType: CardType): SectionCardComponent {
		switch (cardType) {
			case EDetailsCardType.Members:
				return this.membersCard;
			case EDetailsCardType.Address:
				return this.addressCard;
			case EDetailsCardType.Vehicles:
				return this.vehiclesCard;
		}
	}

	private isCardValid(type: EDetailsCardType): boolean {
		switch (type) {
			case EDetailsCardType.Members:
				return this.PrimaryMember.isValid && this.areAdditionalMembersValid();
			case EDetailsCardType.Address:
				return this.Address.isValid;
			case EDetailsCardType.Vehicles:
				return this.areVehiclesValid();
			default:
				return true;
		}
	}

	private areAdditionalMembersValid(): boolean {
		return this.AdditionalMembers.find(m => !m.isValid) == null;
	}

	private areVehiclesValid(): boolean {
		return this.VehiclesState.vehicles.find(m => !m.isValid) == null;
	}

	private showValidationErrors(show: boolean): void {
		this.store.dispatch(new SetShowValidationErrors(show));
	}

	public CompleteCard(type): void {
		this.checkoutAnalyticsService.TrackSectionContinueClicked(type);
		this.showValidationErrors(false);

		if (this.isCardValid(type)) {
			this.cd.markForCheck();

			if (this.shouldSaveCoverOnComplete(type)) {
				this.cover
					.SaveCover(ESaveCoverSource.CheckCardValid, type, () => this.CompleteCard(type))
					.then(() => this.markCardAsComplete(type));
			} else {
				this.markCardAsComplete(type);
			}
		} else {
			setTimeout(() => this.showValidationErrors(true), 0);
		}
	}

	public EditAddress(): void {
		this.store.dispatch(new addressActions.SetManuallyEditAddress(true));
		this.cd.markForCheck();
	}

	public IsCardCompleted(cardType: EDetailsCardType): boolean {
		return this.CardStatus.completedCardTypes.includes(cardType);
	}

	public IsCardOpen(cardType: EDetailsCardType): boolean {
		return this.CardStatus.openCardType === cardType;
	}

	public CompleteContact(contact: Contact): void {
		const type = EDetailsCardType.Members;
		const contactIsValid = contact.PrimaryMember
			? this.PrimaryMember.isValid
			: this.AdditionalMembers.find(m => m.model.Id === contact.Id).isValid;

		if (contactIsValid) {
			this.showValidationErrors(false);
			this.store.dispatch(new contactActions.CompleteContact(contact.Id));
			if (this.shouldSaveCoverOnComplete(type)) {
				this.cover.SaveCover(ESaveCoverSource.CheckCardValid, type, () => this.CompleteContact(this.PrimaryMember.model));
			}
		} else {
			this.showValidationErrors(true);
		}
	}

	public EditContact(contact: Contact): void {
		this.store.dispatch(new contactActions.EditContact(contact.Id));
	}

	public AddExtraPeople(addMembers) {}

	public GetCardVisible(cardType): Observable<boolean> {
		return this.store.select(fromRoot.getVisibleCards).map(visibleCards => !!visibleCards.find(card => card.type === cardType));
	}

	public get HideMembersButton() {
		// If the extra members question answer is yes, but the extra members array
		// is empty then hide the complete button.
		if (this.additionalMembersAnswer && this.AdditionalMembers.length === 0) {
			return true;
		}
		// If there are additional members but they have not been completed then also
		// hide the complete button.
		if (this.AdditionalMembers.length && !this.additionalMembersCompleted()) {
			return true;
		}

		// Otherwise show the button
		return false;
	}

	private additionalMembersCompleted(): boolean {
		return this.AdditionalMembers.every(
			additionalMember =>
				!!this.ContactCardStatus.completedContacts.find(additionalMemberId => additionalMember.model.Id === additionalMemberId)
		);
	}

	public GetMembersCardTitle(): string {
		return this.isVbm() ? this.vbmMembersCardTitle : this.pbmMembersCardTitle;
	}

	private isVbm(): boolean {
		let state: IVehicles;

		this.store
			.select(fromRoot.getVehicles)
			.take(1)
			.subscribe(s => (state = s));

		return state.vehicles && !!state.vehicles.length;
	}

	private shouldSaveCoverOnComplete(cardType: EDetailsCardType): boolean {
		// Slice creates a copy of the array so we don't change the original
		const reversedCards = this.cards.slice().reverse();
		// Remove the payment card from the array and then find the last card which is not visible or readonly.
		const lastVisibleCard = reversedCards.slice(1).find(card => card.visible && !card.readonly && !this.completedCards.includes(card.type));
		// If the last card is the current card then we should move to payment, also if the last card is null then that means all cards are completed so also move to payment.
		return !lastVisibleCard || lastVisibleCard.type === cardType;
	}

	private markCardAsComplete(type: EPaymentCardType | EDetailsCardType): void {
		this.store.dispatch(new cardActions.CompleteCard(type));
	}
}
