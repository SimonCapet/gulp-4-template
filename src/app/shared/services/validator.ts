import { IValidated, ValidationErrors } from 'shared/models/validation.model';

interface IValidationError {
	errors: string | Array<string>;
	value: any;
	path: string;
	inner?: Array<IValidationError>;
}

const isValidationError = (error: any): error is IValidationError => error.errors != null;

const flattenErrors = (error: IValidationError): IValidationError[] => {
	if (error.inner == null || error.inner.length === 0) {
		return [error];
	}
	return error.inner.reduce((errors: IValidationError[], innerError) => [...errors, ...flattenErrors(innerError)], []);
};

const getValidationErrorsByKey = <T>(error: IValidationError): ValidationErrors<T> =>
	flattenErrors(error).reduce((allErrors, currentError) => {
		allErrors[currentError.path] = (allErrors[currentError.path] || []).concat(currentError);
		return allErrors;
	}, {});

export const validate = <T>(validator: any, value: T): IValidated<T> => {
	try {
		const validatedValue = validator.validateSync(value, { abortEarly: false });
		return { model: validatedValue, validationErrors: {}, isValid: true };
	} catch (error) {
		if (isValidationError(error)) {
			return { model: value, validationErrors: getValidationErrorsByKey(error), isValid: false };
		} else {
			throw error;
		}
	}
};

export const getFirstErrorMessage = (validationErrors: IValidationError[]): string | null => {
	return validationErrors && validationErrors.length && validationErrors[0].errors[0];
};
