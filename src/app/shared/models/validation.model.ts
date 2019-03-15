export interface IValidationError {
	errors: string | Array<string>;
	value: any;
	path: string;
	inner?: Array<IValidationError>;
	message?: string;
	type: string;
	params: {
		max?: number;
		array?: any[];
	};
}

export type ValidationErrors<T> = { [P in keyof T]?: IValidationError[] };

export interface IValidated<T> {
	model: T;
	validationErrors: ValidationErrors<T>;
	isValid: boolean;
}
