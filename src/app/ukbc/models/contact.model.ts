import { IValidated } from 'shared/models/validation.model';
const UUID = require('uuid/v4');

export class Contact {
	public Id = UUID();
	public PrimaryMember: boolean;
	public Title: string;
	public FirstName: string;
	public LastName: string;
	public DOB: Date | null;
	public Email: string;
	// API accepts TelephoneNumber and / or MobileNumber
	public PhoneNumber: string;

	constructor(PrimaryMember = false, Title = '', FirstName = '', LastName = '', DOB = null, Email = '', PhoneNumber = '') {
		this.PrimaryMember = PrimaryMember;
		this.Title = Title;
		this.FirstName = FirstName;
		this.LastName = LastName;
		this.DOB = DOB;
		this.Email = Email;
		this.PhoneNumber = PhoneNumber;
	}
}

// Form field event payload
export interface IContactFields {
	contact: Contact;
	field: string;
	value: string;
}

export type ValidatedContact = IValidated<Contact>;

export interface IInitialContact {
	Title: string;
	FirstName: string;
	LastName: string;
	DOB: string;
	Email?: string;
	PhoneNumber?: string;
}
