import { IValidated } from 'shared/models';

export interface IEagleEyeToken {
	value: string;
}

export interface IEagleEyeState {
	token: IValidated<IEagleEyeToken>;
	isTokenVerified: boolean;
	isVerificationLoading: boolean;
	tokenValue: number;
}

export interface IEagleEyeVerificationResponse {
	Success: boolean;
	VoucherCode: string;
	Value: number;
	ErrorDescription: string;
}
