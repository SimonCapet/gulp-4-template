import { Action } from '@ngrx/store';

export interface IErrorState {
	error: IError;
}

export interface IError {
	errorCode: string;
	action?: Action;
	hideCloseButton?: boolean;
	reload?: boolean;
	retryCallback?: Function;
}
