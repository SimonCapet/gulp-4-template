import { ValidatedContact } from 'ukbc/models';

export interface IContacts extends IContactCardStatus {
	contacts: ValidatedContact[];
}

export interface IContactCardStatus {
	completedContacts: string[];
	openContact: string;
	addAdditionalContacts?: boolean;
	minimumContacts?: number;
}
