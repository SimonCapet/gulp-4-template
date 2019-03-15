import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IContactCardStatus, Contact, IContactFields, IInitialState, IJourneyContent } from 'ukbc/models';
import { IValidated } from 'shared/models/validation.model';
import { CreateDialogAction, OpenDialogAction } from 'ukbc/actions';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromRoot from 'ukbc/reducers';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'ukbc-details-members',
	templateUrl: './members.component.html',
})
export class DetailsMembersComponent {
	@Input() primaryMember: IValidated<Contact>;
	@Input() additionalMembers: IValidated<Contact[]>;
	@Input() contactCardStatus: IContactCardStatus;
	@Input() isOpen: boolean;
	@Input() forceShowValidationErrors = false;
	@Input() cardType: string;

	@Output() setField = new EventEmitter<IContactFields>();
	@Output() onFocus = new EventEmitter<FocusEvent>();
	@Output() completeContact = new EventEmitter();
	@Output() editContact = new EventEmitter();
	@Output() onOpen = new EventEmitter<string>();

	public Content$: Observable<IInitialState>;
	public JourneyContent$: Observable<IJourneyContent>;
	public ShouldShowDataHandlingLink$: Observable<boolean>;

	constructor(private store: Store<fromRoot.State>) {
		this.Content$ = store.select(fromRoot.getContent);
		this.JourneyContent$ = store.select(fromRoot.getJourneyContent);
		this.ShouldShowDataHandlingLink$ = this.Content$.map(c => !!c.ContentInformation.GeneralInfo.LookAfterLinkContent);
		this.createDataHandlingDialog();
	}

	public isContactComplete(id): boolean {
		return this.contactCardStatus.completedContacts.find(contactId => contactId === id) != null;
	}

	public ContactsChanged(index, contact: IValidated<Contact>) {
		return contact.model.Id;
	}

	public EditContact(contact: Contact): void {
		if (!this.isOpen) {
			this.onOpen.emit(this.cardType);
		}
		this.editContact.emit(contact);
	}

	private createDataHandlingDialog(): void {
		this.Content$.pipe(take(1)).subscribe(content => {
			this.store.dispatch(
				new CreateDialogAction({
					id: 'data-handling',
					content: content.ContentInformation.GeneralInfo.LookAfterLinkContent,
					open: false,
				})
			);
		});
	}

	public ShowDataHandlingDialog(): void {
		this.store.dispatch(new OpenDialogAction({ id: 'data-handling' }));
	}
}
