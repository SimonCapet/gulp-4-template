import yup from 'yup';

import { IAddress } from 'shared/models';
import { Contact, IConsent, ICover, IInitialState, IPayment, Vehicle, IVehicleState } from 'ukbc/models';
import { IAddressPickerDetails } from 'shared/models/address.model';
import { getCurrentYear } from 'scripts/utils/getCurrentYear.util';
import { IVehicleRuleConfig } from 'shared/models/vehicle.model';
import { EValidationErrorType } from 'shared/enums';
import { IEagleEyeToken } from 'ukbc/models/eagle-eye.model';

const initialState: IInitialState = (<any>window).UKBC_initialState;
const content = initialState.ContentInformation.GeneralInfo;
const journeyContent = initialState.ContentInformation.Journey;
const minCoverStartDate = new Date();
minCoverStartDate.setHours(0, 0, 0, 0);
const maxCoverStartDate = new Date();
maxCoverStartDate.setDate(new Date().getDate() + 60);

type ValidationRules<T> = { [P in keyof T]?: any };

const primaryContactValidationRules: ValidationRules<Contact> = {
	Title: yup
		.string()
		.required(content.ErrorTitleRequired)
		.nullable(),
	FirstName: yup
		.string()
		.trim()
		.required(content.ErrorFirstNameRequired)
		.max(50, content.ErrorFirstNameLength)
		.matches(/^[a-zA-Z-'`: ]*$/, content.ErrorFirstNameInvalid)
		.nullable(),
	LastName: yup
		.string()
		.trim()
		.required(content.ErrorSurnameRequired)
		.max(70, content.ErrorSurnameLength)
		.matches(/^[a-zA-Z-'`: ]*$/, content.ErrorSurnameInvalid)
		.nullable(),
	Email: yup
		.string()
		.required(content.ErrorEmailRequired)
		.email(content.ErrorEmailInvalid)
		.max(80, content.ErrorEmailLength)
		.nullable(),
	PhoneNumber: yup
		.string()
		.required(content.ErrorPhoneNumberRequired)
		.max(16, content.ErrorPhoneNumberLength)
		.matches(/^[\+0-9\-()\s]{8,}$/, content.ErrorPhoneNumberInvalid)
		.nullable(),
	DOB: yup
		.date()
		.required(content.ErrorDateOfBirthRequired)
		.typeError(content.ErrorDateOfBirthInalid)
		.min(new Date(new Date().setFullYear(new Date().getFullYear() - 111)), content.ErrorDateOfBirthRangeMax)
		.max(new Date(new Date().setFullYear(new Date().getFullYear() - 16)), content.ErrorDateOfBirthRangeMinPrimary)
		.nullable(),
};

const additionalContactValidationRules: ValidationRules<Contact> = {
	...primaryContactValidationRules,
	DOB: yup
		.date()
		.required(content.ErrorDateOfBirthRequired)
		.typeError(content.ErrorDateOfBirthInalid)
		.min(new Date(new Date().setFullYear(new Date().getFullYear() - 111)), content.ErrorDateOfBirthRangeMax)
		.max(new Date(new Date().setFullYear(new Date().getFullYear())), content.ErrorDateOfBirthRangeMinSecondary)
		.nullable(),
	Email: yup.string().nullable(),
	PhoneNumber: yup.string().nullable(),
};

export const primaryContactValidator = yup.object().shape(primaryContactValidationRules);
export const additionalContactValidator = yup.object().shape(additionalContactValidationRules);

const postcodeRule = yup
	.string()
	.required(content.ErrorPostcodeRequired)
	.matches(
		// tslint:disable-next-line:max-line-length
		/^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/,
		content.ErrorPostcodeInvalid
	)
	.nullable();

const addressValidationRules: ValidationRules<IAddress> = {
	AddressLine1: yup
		.string()
		.required(content.ErrorAddressLineOneRequired)
		.max(50, content.ErrorAddressLineOneLength)
		.matches(/^[0-9a-zA-Z-',.\/ &]*$/, content.ErrorAddressLineOneInvalid)
		.nullable(),
	AddressLine2: yup
		.string()
		.max(50, content.ErrorAddressLineTwoLength)
		.matches(/^[0-9a-zA-Z-',.\/ &]*$/, content.ErrorAddressLineTwoInvalid)
		.nullable(),
	AddressLine3: yup
		.string()
		.max(50, content.ErrorAddressLineThreeLength)
		.matches(/^[0-9a-zA-Z-',.\/ &]*$/, content.ErrorAddressLineThreeInvalid)
		.nullable(),
	Town: yup
		.string()
		.required(content.ErrorTownRequired)
		.max(50, content.ErrorTownLength)
		.matches(/^[a-zA-Z-',.\/ &]*$/, content.ErrorTownInvalid)
		.nullable(),
	County: yup
		.string()
		.max(50, content.ErrorCountyLength)
		.matches(/^[a-zA-Z-',.\/ &]*$/, content.ErrorCountyInvalid)
		.nullable(),
	Postcode: postcodeRule,
};

export const addressValidator = yup.object().shape(addressValidationRules);

const addressPickerValidationRules: ValidationRules<IAddressPickerDetails> = {
	AddressLine1: yup
		.string()
		.max(50, content.ErrorAddressLineOneLength)
		.nullable(),
	Postcode: postcodeRule,
};

export const addressPickerValidator = yup.object().shape(addressPickerValidationRules);

const consentValidationRules: ValidationRules<IConsent> = {
	AgreeTermsAndConditions: yup
		.boolean()
		.test('is-true', 'Please agree to terms and conditions', value => value)
		.required()
		.nullable(),
	AgreeEmail: yup
		.string()
		.required()
		.nullable(),
	AgreePaperless: yup
		.string()
		.required()
		.nullable(),
};

export const consentValidator = yup.object().shape(consentValidationRules);

export const coverRules: ValidationRules<ICover> = {
	StartDate: yup
		.date()
		.required(content.ErrorMembershipStartDateRequired)
		.typeError(content.ErrorMembershipStartDateInvalid)
		.min(minCoverStartDate, content.ErrorMembershipStartDateMin)
		.max(maxCoverStartDate, content.ErrorMembershipStartDateMax)
		.nullable(),
};

const collectionDateRule = yup
	.string()
	.required(content.ErrorCollectionDateRequired)
	.nullable();

const directDebitDetailRules: ValidationRules<IPayment> = {
	accountName: yup
		.string()
		.required(content.ErrorAccountNameRequired)
		.nullable(),
	accountNumber: yup
		.string()
		.required(content.ErrorAccountNumberRequired)
		.test('isNumber', content.ErrorAccountNumberNumbersOnly, value => !isNaN(value))
		.max(8, content.ErrorAccountNumberMaxLength)
		.nullable(),
	sortCode: yup
		.string()
		.required(content.ErrorSortCodeRequired)
		.test('isNumber', content.ErrorSortCodeNumbersOnly, value => !isNaN(value))
		.min(6, content.ErrorSortCodeMinLength)
		.nullable(),
	collectionDate: collectionDateRule,
};

const paymentDetailsWithCollectionDateRules: ValidationRules<IPayment> = {
	collectionDate: collectionDateRule,
};

export const directDebitDetailsValidator = yup.object().shape(directDebitDetailRules);
export const cardPaymentValidator = yup.object();
export const cardPaymentWithCollectionDateValidator = yup.object().shape(paymentDetailsWithCollectionDateRules);

export const directDebitTermsAndConditionsValidator = yup.boolean().test('isTrue', content.DirectDebitAgreeToTermsWarningMessage, value => {
	return !!value;
});

export const coverValidator = yup.object().shape(coverRules);

export function generateVehicleLookupValidator(vehicle: Vehicle, vehicles?: IVehicleState[]) {
	const rules: any = {
		Vrm: generateVrmRule(vehicle, vehicles),
	};

	const mileageRule = vehicle.MileageRule;

	if (mileageRule) {
		rules.Mileage = generateMileageRule(mileageRule);
	}

	return yup.object().shape(rules);
}

const vehicleValidationRules: ValidationRules<Vehicle> = {
	Make: yup
		.string()
		.required(content.ErrorVehicleMakeRequired)
		.nullable(),
	Model: yup
		.string()
		.required(content.ErrorVehicleModelRequired)
		.nullable(),
	Year: yup
		.number()
		.required(content.ErrorVehicleYearRequired)
		.typeError(content.ErrorVehicleValidYear)
		.max(getCurrentYear(), content.ErrorVehicleValidYear)
		.min(new Date().getFullYear() - 131, content.ErrorVehicleYearMin)
		.nullable(),
};

export function generateVehicleValidator(vehicle: Vehicle, vehicles?: IVehicleState[]) {
	const rules = { ...vehicleValidationRules };

	rules.Vrm = generateVrmRule(vehicle, vehicles);

	const ageRule = vehicle.AgeRule;

	if (ageRule) {
		rules.Age = yup
			.number()
			.max(ageRule.Value, ageRule.Error)
			.nullable();
	}

	const mileageRule = vehicle.MileageRule;

	if (mileageRule) {
		rules.Mileage = generateMileageRule(mileageRule);
	}

	const fuelRule = vehicle.FuelRule;

	if (fuelRule) {
		rules.Fuel = generateFuelRule(fuelRule);
	}

	return yup.object().shape(rules);
}

function generateVrmRule(vehicle: Vehicle, vehicles?: IVehicleState[]) {
	if (vehicles && vehicles.length > 1) {
		const vehicleRegexes = vehicles.filter(v => v.model.Id !== vehicle.Id && v.model.Vrm.replace(/\s/g, '')).map(v => {
			return v.model.Vrm
				.replace(/\s/g, '')
				.toUpperCase()
				.split('')
				.map(c => (isNaN(<any>c) ? `[${c.toUpperCase()}${c.toLowerCase()}]` : c))
				.join(' *');
		});

		if (vehicleRegexes.length) {
			const regex = new RegExp(`^(?!^${vehicleRegexes.join('|')}$)([A-Z0-9 ])*`);

			return yup
				.string()
				.required(content.ErrorVehicleRegistrationRequired)
				.transform(value => value.trim())
				.matches(/^[a-zA-Z0-9 ]*$/, content.ErrorVehicleRegistrationPattern)
				.matches(regex, content.ErrorVehicleRegistrationDuplicate.replace('{0}', vehicle.Vrm.toUpperCase()))
				.nullable();
		}
	}

	return yup
		.string()
		.required(content.ErrorVehicleRegistrationRequired)
		.matches(/^[a-zA-Z0-9 ]*$/, content.ErrorVehicleRegistrationPattern)
		.nullable();
}

function generateMileageRule(mileageRule: IVehicleRuleConfig) {
	return yup
		.number()
		.required(content.ErrorVehicleMileageRequired)
		.typeError(content.ErrorVehicleValidMileage)
		.max(mileageRule.Value, mileageRule.Error)
		.min(0, content.ErrorVehicleValidMileage)
		.nullable();
}

function generateFuelRule(fuelRule: IVehicleRuleConfig) {
	const fuelTypeArray: string[] = Array.isArray(fuelRule.Value) ? fuelRule.Value : JSON.parse(<string>fuelRule.Value);
	return yup
		.string()
		.required(content.ErrorVehicleFuelRequired)
		.nullable()
		.test({
			name: EValidationErrorType.NotInArray,
			message: fuelRule.Error,
			params: { array: fuelRule.Value },
			test: value => {
				return !fuelTypeArray.includes(value);
			},
		});
}

const eagleEyeValidationRules: ValidationRules<IEagleEyeToken> = {
	value: yup
		.string()
		.trim()
		.required(journeyContent.ErrorEagleEyeTokenRequired),
};

if (journeyContent.EagleEyeTokenFormatRegex) {
	eagleEyeValidationRules.value = eagleEyeValidationRules.value.matches(
		new RegExp(journeyContent.EagleEyeTokenFormatRegex),
		journeyContent.ErrorEagleEyeTokenInvalidFormat
	);
}

export const eagleEyeTokenValidator = yup.object().shape(eagleEyeValidationRules);
