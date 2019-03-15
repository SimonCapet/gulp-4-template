import * as pricingActions from 'ukbc/actions/pricing.actions';
import { IPriceState, IAnnualAndMonthly, IGeneralContent, IPrice, ITotalPrice, IProductPrices, IJourneyContent } from 'ukbc/models';
import { EPurchaseType } from 'ukbc/enums';
import { getSessionStorageReducerState, toPounds } from 'shared/helpers';
import { useMonthlyAsDefault } from 'ukbc/helpers';
import { EPolicyDuration } from 'ukbc/enums/policyDuration.enum';

export type State = IPriceState;

const savedState: State = getSessionStorageReducerState('pricing');

const DefaultPurchaseType = useMonthlyAsDefault() ? EPurchaseType.Monthly : EPurchaseType.Annual;
const { Journey } = (<any>window).UKBC_initialState.ContentInformation;

const initialState: State = savedState || {
	total: {
		annual: null,
		twoYear: null,
		annualWithoutDiscount: null,
		monthly: null,
		comparisonAnnual: null,
		comparisonMonthly: null,
	},
	annualPrices: {},
	monthlyPrices: {},
	twoYearPrices: {},
	comparisonAnnualPrices: {},
	comparisonMonthlyPrices: {},
	received: false,
	receiving: false,
	frequency: DefaultPurchaseType,
	duration: Journey.TwoYearPolicy ? Journey.TwoYearPolicyDefault : EPolicyDuration.Unset,
	MonthlyDiscountedInstallmentPrefix: '',
	MonthlyDiscountedInstallmentSuffix: '',
	twoYearPolicyMessage: '',
};

initialState.received = false;

export function reducer(state: State = initialState, action: pricingActions.Actions): State {
	switch (action.type) {
		case pricingActions.GET_PRICES:
		case pricingActions.GET_TOTAL:
			return Object.assign({}, state, { receiving: true });
		case pricingActions.SET_PRICES:
			const {
				AnnualPrices,
				MonthlyPrices,
				TwoYearPrices,
				ComparisonAnnualPrices,
				ComparisonMonthlyPrices,
				MonthlyDiscountedInstallmentPrefix,
				MonthlyDiscountedInstallmentSuffix,
				TwoYearPolicyMessage,
			} = action.payload;

			const monthlyAmount =
				action.payload.DiscountedMonthlyAmount > 0 ? action.payload.DiscountedMonthlyAmount : action.payload.MonthlyAmount;
			const total: ITotalPrice = {
				annual: action.payload.TotalToPayWithDiscount,
				twoYear: action.payload.TwoYearPolicyTotalToPay,
				annualWithoutDiscount: action.payload.TotalToPay,
				annualUsingEagleEyeVouchers: action.payload.TotalToPayUsingVouchers,
				monthly: monthlyAmount,
				comparisonAnnual: action.payload.ComparisonTotalToPay,
				comparisonMonthly: action.payload.ComparisonMonthlyAmount,
			};
			return Object.assign({}, state, {
				total,
				annualPrices: AnnualPrices,
				monthlyPrices: MonthlyPrices,
				twoYearPrices: TwoYearPrices,
				comparisonAnnualPrices: ComparisonAnnualPrices,
				comparisonMonthlyPrices: ComparisonMonthlyPrices,
				MonthlyDiscountedInstallmentPrefix: MonthlyDiscountedInstallmentPrefix,
				MonthlyDiscountedInstallmentSuffix: MonthlyDiscountedInstallmentSuffix,
				received: true,
				receiving: false,
				twoYearPolicyMessage: TwoYearPolicyMessage,
			});
		case pricingActions.CONFIRM_SET_FREQUENCY:
			return Object.assign({}, state, { frequency: action.payload });
		case pricingActions.RESET_PRICING:
			return Object.assign({}, state, { received: false, receiving: false });
		case pricingActions.SET_POLICY_DURATION:
			return Object.assign({}, state, { duration: action.payload });
		default:
			return state;
	}
}

export const getFrequency = (state: State) => state.frequency;

export const getDuration = (state: State) => state.duration;

export const getPricing = (state: State) => {
	const pricing: IPrice = {
		received: state.received,
		receiving: state.receiving,
		frequency: state.frequency,
		duration: state.duration,
		total: 0,
		totalWithoutDiscount: 0,
		comparisonTotal: 0,
		prices: {},
	};

	switch (state.frequency) {
		case EPurchaseType.Monthly:
			pricing.total = state.total.monthly;
			pricing.totalWithoutDiscount = state.total.monthly;
			pricing.comparisonTotal = state.total.comparisonMonthly;
			pricing.prices = state.monthlyPrices;
			break;
		case EPurchaseType.Annual:
			pricing.total = state.duration === EPolicyDuration.TwoYears ? state.total.twoYear : state.total.annual;
			pricing.totalWithoutDiscount = state.total.annualWithoutDiscount;
			pricing.totalToPayUsingEagleEyeVouchers = state.total.annualUsingEagleEyeVouchers;
			pricing.comparisonTotal = state.total.comparisonAnnual;
			pricing.prices = state.duration === EPolicyDuration.TwoYears ? state.twoYearPrices : state.annualPrices;
			break;
	}
	return pricing;
};

export const getAnnualAndMonthlyPricing = (state: State): IAnnualAndMonthly => ({
	annual: state.total.annual,
	monthly: state.total.monthly,
	twoYear: state.total.twoYear,
});

export const getItemPrices = (state: State): IProductPrices => {
	switch (state.frequency) {
		case EPurchaseType.Monthly:
			return state.monthlyPrices;
		case EPurchaseType.Annual:
			if (state.duration === EPolicyDuration.TwoYears) {
				return state.twoYearPrices;
			}
			return state.annualPrices;
	}
};

export const getComparisonPrices = (state: State): IProductPrices => {
	switch (state.frequency) {
		case EPurchaseType.Monthly:
			return state.comparisonMonthlyPrices;
		case EPurchaseType.Annual:
			return state.comparisonAnnualPrices;
	}
};

export const getAddProductButtonPriceSuffix = (frequency: EPurchaseType, content: IGeneralContent): string => {
	switch (frequency) {
		case EPurchaseType.Monthly:
			return content.AddProductButtonPriceSuffixMonthly;
		case EPurchaseType.Annual:
			return content.AddProductButtonPriceSuffixAnnual;
		default:
			return '';
	}
};

export const getPricePrefix = (state: State, frequency: EPurchaseType): string => {
	switch (frequency) {
		case EPurchaseType.Monthly:
			return state.MonthlyDiscountedInstallmentPrefix;
		default:
			return '';
	}
};

export const getPriceSuffix = (state: State, frequency: EPurchaseType): string => {
	if (state.MonthlyDiscountedInstallmentSuffix && frequency === EPurchaseType.Monthly) {
		return state.MonthlyDiscountedInstallmentSuffix;
	}
	return '';
};

export const getTwoYearPolicyMessage = (state: State): string => {
	if (state.twoYearPolicyMessage) {
		return state.twoYearPolicyMessage;
	}
	return '';
};
