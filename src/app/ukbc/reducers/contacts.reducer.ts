import * as contactActions from 'ukbc/actions/contact.actions';
import { IContacts, Contact, ValidatedContact } from 'ukbc/models';
import { additionalContactValidator, primaryContactValidator } from 'ukbc/validation-rules';
import { validate } from 'shared/services/validator';
import { getSessionStorageReducerState } from 'shared/helpers';
import { getProductNumberFromProductCode } from 'ukbc/helpers';

const content = (<any>window).UKBC_initialState;
export const preSelectedProducts = content.ContentInformation.Journey.PreSelectedProducts;
export const preSelectedContacts = content.PreSelectedContacts;

export type State = IContacts;

const getInitialNumberOfContacts = () => {
	const pbmProduct = preSelectedProducts.find(p => {
		const productType = p.slice(0, 3);
		return productType === 'PBM';
	});
	return pbmProduct ? getProductNumberFromProductCode(pbmProduct) : 1;
};

const validateContact = (contact: Contact): ValidatedContact =>
	validate(contact.PrimaryMember ? primaryContactValidator : additionalContactValidator, contact);

const createInitialContact = (index: number) => {
	const isPrimary = index === 0;
	const preSelectedContact = preSelectedContacts && preSelectedContacts[index];
	return preSelectedContact
		? new Contact(
				isPrimary,
				preSelectedContact.Title,
				preSelectedContact.FirstName,
				preSelectedContact.LastName,
				preSelectedContact.DOB ? new Date(preSelectedContact.DOB) : null,
				preSelectedContact.Email,
				preSelectedContact.PhoneNumber
			)
		: new Contact(isPrimary);
};

const createInitialContacts = (): ValidatedContact[] => {
	const numberOfContacts = getInitialNumberOfContacts();
	return Array(numberOfContacts)
		.fill(0)
		.map((_, i) => validateContact(createInitialContact(i)));
};

const savedState: State = getSessionStorageReducerState('contacts', true);

const getInitialState = (): State => {
	if (savedState) {
		return savedState;
	}

	const contacts = createInitialContacts();

	const completedContacts =
		preSelectedContacts && preSelectedContacts.length ? contacts.slice(0, preSelectedContacts.length).map(c => c.model.Id) : [];
	const openContact = (contacts[completedContacts.length] && contacts[completedContacts.length].model.Id) || '';

	return {
		contacts,
		completedContacts,
		openContact,
	};
};

const initialState: State = getInitialState();

// Set number of contacts
const setContacts = (state: State, newNumberOfContacts: number): State => {
	const contacts: ValidatedContact[] = [...state.contacts];
	const previousNumberOfContacts = contacts.length;

	if (previousNumberOfContacts < newNumberOfContacts) {
		for (let c = contacts.length; c < newNumberOfContacts; c++) {
			contacts.push(validateContact(new Contact(false)));
		}
		const openContact = state.openContact || contacts[previousNumberOfContacts].model.Id;
		return { ...state, contacts, openContact };
	} else if (previousNumberOfContacts > newNumberOfContacts && newNumberOfContacts > 0) {
		contacts.splice(newNumberOfContacts);
		const currentContactIds = contacts.map(contact => contact.model.Id);
		const completedContacts = state.completedContacts.filter(id => currentContactIds.includes(id));

		let openContact;

		// If the open contact has been removed, open any uncompleted contacts

		if (completedContacts.length < contacts.length) {
			openContact = contacts.find(contact => !completedContacts.includes(contact.model.Id)).model.Id;
		}

		return { contacts, openContact, completedContacts };
	} else {
		return state;
	}
};

function modifyContact(contact: ValidatedContact, action: contactActions.SetContactField): ValidatedContact {
	if (contact.model.Id !== action.payload.contact.Id) {
		return contact;
	} else {
		const updatedModel = {
			...contact.model,
			[action.payload.field]: action.payload.value,
		};
		return validateContact(updatedModel);
	}
}

function getNextContact(stateCopy: State) {
	return stateCopy.contacts
		.slice(1, stateCopy.contacts.length)
		.find(contact => stateCopy.completedContacts.indexOf(contact.model.Id) === -1);
}

const completeContact = (stateCopy: State, contactId) => {
	if (stateCopy.completedContacts.indexOf(contactId) === -1) {
		stateCopy.completedContacts.push(contactId);
	}
	const nextContact = getNextContact(stateCopy);
	stateCopy.openContact = typeof nextContact !== 'undefined' ? nextContact.model.Id : '';

	return stateCopy;
};

export function reducer(state: State = initialState, action: contactActions.Actions): State {
	switch (action.type) {
		case contactActions.EDIT_CONTACT:
			const contactIds = state.contacts.map(c => c.model.Id);
			const targetIndex = contactIds.indexOf(action.payload);
			const completedContacts = state.completedContacts.filter(contactId => contactIds.indexOf(contactId) < targetIndex);
			return { ...state, openContact: action.payload, completedContacts };
		case contactActions.COMPLETE_CONTACT:
			return { ...completeContact(state, action.payload) };
		case contactActions.SET_CONTACTS:
			return setContacts(state, action.payload);
		case contactActions.SET_CONTACT_FIELD:
			const updatedContacts = state.contacts.map(p => modifyContact(p, action));
			return Object.assign({}, { ...state, contacts: updatedContacts });
		default:
			return state;
	}
}

export const getAllContacts = (state: State) => state;
export const getPrimaryMember = (state: State) => state.contacts[0];
export const getAdditionalMembers = (state: State) => state.contacts.slice(1, state.contacts.length);
export const getAddAdditionalMembers = (state: State) => state.addAdditionalContacts;
export const getContactsCardState = (state: State) => ({
	openContact: state.openContact,
	completedContacts: state.completedContacts,
});
