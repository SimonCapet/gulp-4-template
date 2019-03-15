import { ActionReducerMap, createSelector, createFeatureSelector, MetaReducer } from '@ngrx/store';

import { sessionStorageMiddleware, setReducersToStore, setExpiresAfter } from 'shared/helpers';

/*
 * Every reducer module's default export is the reducer function itself. In
 * addition, each module should export a type or interface that describes
 * the state of the reducer plus any selector functions. The `* as`
 * notation packages up all of the exports into a single object.
 */

import * as fromLayout from 'ukbc/reducers/layout.reducer';
import * as fromProduct from 'ukbc/reducers/products/product.reducer';
import * as fromContacts from 'ukbc/reducers/contacts.reducer';
import * as fromAddress from 'ukbc/reducers/address.reducer';
import * as fromVehicles from 'ukbc/reducers/vehicles/vehicles.reducer';
import * as fromPricing from 'ukbc/reducers/pricing.reducer';
import * as fromStep from 'ukbc/reducers/step.reducer';
import * as fromContent from 'ukbc/reducers/content.reducer';
import * as fromCard from 'ukbc/reducers/card/card.reducer';
import * as fromConsent from 'ukbc/reducers/consent.reducer';
import * as fromCover from 'ukbc/reducers/cover.reducer';
import * as fromPayment from 'ukbc/reducers/payment/payment.reducer';
import * as fromValidation from 'ukbc/reducers/validation/validation.reducer';
import * as fromError from 'ukbc/reducers/errors.reducer';
import * as fromDialogs from 'ukbc/reducers/dialogs.reducer';
import * as fromSession from 'ukbc/reducers/session.reducer';
import * as fromQuestions from 'ukbc/reducers/questions/questions.reducer';
import * as fromLoading from 'ukbc/reducers/loading.reducer';
import * as fromEagleEye from 'ukbc/reducers/eagle-eye.reducer';
import { IInitialState } from 'ukbc/models';

const initialState: IInitialState = (<any>window).UKBC_initialState;

/*
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface State {
	layout: fromLayout.State;
	products: fromProduct.State;
	contacts: fromContacts.State;
	address: fromAddress.State;
	vehicles: fromVehicles.State;
	pricing: fromPricing.State;
	step: fromStep.State;
	content: fromContent.State;
	card: fromCard.State;
	consent: fromConsent.State;
	cover: fromCover.State;
	payment: fromPayment.State;
	dialogs: fromDialogs.State;
	validation: fromValidation.State;
	error: fromError.State;
	session: fromSession.State;
	questions: fromQuestions.State;
	loading: fromLoading.ILoadingState;
	eagleEye: fromEagleEye.State;
}

/*
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const reducers: ActionReducerMap<State> = {
	layout: fromLayout.reducer,
	products: fromProduct.reducer,
	contacts: fromContacts.reducer,
	address: fromAddress.reducer,
	vehicles: fromVehicles.reducer,
	pricing: fromPricing.reducer,
	step: fromStep.reducer,
	content: fromContent.reducer,
	card: fromCard.reducer,
	consent: fromConsent.reducer,
	cover: fromCover.reducer,
	payment: fromPayment.reducer,
	dialogs: fromDialogs.reducer,
	validation: fromValidation.reducer,
	error: fromError.reducer,
	session: fromSession.reducer,
	questions: fromQuestions.reducer,
	loading: fromLoading.reducer,
	eagleEye: fromEagleEye.reducer,
};

setExpiresAfter(initialState.ContentInformation.GeneralInfo.ServerTimeout);

setReducersToStore([
	'step',
	'address',
	'consent',
	'contacts',
	'card',
	'payment',
	'products',
	'vehicles',
	'cover',
	'pricing',
	'error',
	'session',
	'questions',
	'layout',
	'eagleEye',
]);
/*
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<State>[] = [sessionStorageMiddleware];
/*
 * Layout Reducers
 */
export const getLayoutState = createFeatureSelector<fromLayout.State>('layout');

export const getBasketOpen = createSelector(getLayoutState, fromLayout.getBasketOpen);

export const getBasketHidden = createSelector(getLayoutState, fromLayout.getBasketHidden);

export const getBasketBasisItemHidden = createSelector(getLayoutState, fromLayout.getBasketBasisItemHidden);

export const getScrollOffset = createSelector(getLayoutState, fromLayout.getScrollOffset);

export const getQuestionsProgressHidden = createSelector(getLayoutState, fromLayout.getQuestionsProgressHidden);

/*
 * Content Reducers
 */

export const getContentState = createFeatureSelector<fromContent.State>('content');

export const getContent = createSelector(getContentState, fromContent.getContent);

export const getGeneralContent = createSelector(getContentState, fromContent.getGeneralContent);

export const getPackageContent = createSelector(getContentState, fromContent.getPackageContent);

export const getLiveChatContent = createSelector(getContentState, fromContent.getLiveChatContent);

export const getErrorsContent = createSelector(getContentState, fromContent.getErrorsContent);

export const getJourneyContent = createSelector(getContentState, fromContent.getJourneyContent);

export const getOffer = createSelector(getContentState, fromContent.getOffer);

export const getAPIURLs = createSelector(getContentState, fromContent.getAPIURLs);

export const getPreSelectedContacts = createSelector(getContentState, fromContent.getPreSelectedContacts);

export const getPreSelectedAddress = createSelector(getContentState, fromContent.getPreSelectedAddress);

export const getIsRenewal = createSelector(getContentState, fromContent.getIsRenewal);

/*
 * Product Reducers
 */
export const getProductsState = createFeatureSelector<fromProduct.State>('products');

export const getAllProducts = createSelector(getProductsState, fromProduct.getAllProducts);

export const getSelectedProducts = createSelector(getProductsState, fromProduct.getSelectedProducts);

export const getSelectedProductCodes = createSelector(getProductsState, fromProduct.getSelectedProductCodes);

export const getHistoricalProducts = createSelector(getProductsState, fromProduct.getHistoricalProducts);

export const getBasketProducts = createSelector(getProductsState, fromProduct.getBasketProducts);

export const getBitSet = createSelector(getProductsState, fromProduct.getBitSet);

export const getMaxPbmProducts = createSelector(getProductsState, fromProduct.getMaxPbmProducts);

export const getMaxLCPProducts = createSelector(getProductsState, fromProduct.getMaxLCPProducts);

export const getMaxVbmProducts = createSelector(getProductsState, fromProduct.getMaxVbmProducts);

export const getIncludedAsStandardProducts = createSelector(getProductsState, fromProduct.getIncludedAsStandardProducts);

export const getProductsInPackage = createSelector(getProductsState, fromProduct.getProductsInPackage);

export const getBasisValues = createSelector(getProductsState, fromProduct.getBasisValues);

export const getBasisProductCodes = createSelector(getProductsState, fromProduct.getBasisProductCodes);

export const getCoverBasisType = createSelector(getProductsState, fromProduct.getCoverBasisType);

export const getAvailableParentProducts = createSelector(getProductsState, fromProduct.getAvailableParentProducts);

/*
 * Contact Reducers
 */

export const getContactsState = createFeatureSelector<fromContacts.State>('contacts');

export const getAllContacts = createSelector(getContactsState, fromContacts.getAllContacts);
export const getPrimaryMember = createSelector(getContactsState, fromContacts.getPrimaryMember);
export const getAdditionalMembers = createSelector(getContactsState, fromContacts.getAdditionalMembers);
export const getAddAdditionalMembers = createSelector(getContactsState, fromContacts.getAddAdditionalMembers);
export const getContactCardState = createSelector(getContactsState, fromContacts.getContactsCardState);

/*
 * Contact Details Reducers
 */

export const getAddressState = createFeatureSelector<fromAddress.State>('address');
export const getAddress = createSelector(getAddressState, fromAddress.getAddress);

/*
 * Vehicle Reducers
 */

export const getVehiclesState = createFeatureSelector<fromVehicles.State>('vehicles');
export const getVehicles = createSelector(getVehiclesState, fromVehicles.getVehicles);
export const getInvalidVehicles = createSelector(getVehiclesState, fromVehicles.getInvalidVehicles);
export const getCompletedVehicles = createSelector(getVehiclesState, fromVehicles.getCompletedVehicles);
export const getInvalidAgeVehicles = createSelector(getVehiclesState, fromVehicles.getInvalidAgeVehicles);
export const getInvalidMileageVehicles = createSelector(getVehiclesState, fromVehicles.getInvalidMileageVehicles);
export const getInvalidFuelVehicles = createSelector(getVehiclesState, fromVehicles.getInvalidFuelVehicles);
export const getVehiclesValidAndCompleted = createSelector(getVehiclesState, fromVehicles.getVehiclesValidAndCompleted);

/*
 * Pricing Reducers
 */

export const getPricingState = createFeatureSelector<fromPricing.State>('pricing');

export const getPricing = createSelector(getPricingState, fromPricing.getPricing);

export const getFrequency = createSelector(getPricingState, fromPricing.getFrequency);

export const getDuration = createSelector(getPricingState, fromPricing.getDuration);

export const getAnnualAndMonthlyPricing = createSelector(getPricingState, fromPricing.getAnnualAndMonthlyPricing);

export const getItemPrices = createSelector(getPricingState, fromPricing.getItemPrices);

export const getComparisonPrices = createSelector(getPricingState, fromPricing.getComparisonPrices);

export const getAddProductButtonPriceSuffix = createSelector(getFrequency, getGeneralContent, fromPricing.getAddProductButtonPriceSuffix);

export const getPricePrefix = createSelector(getPricingState, getFrequency, fromPricing.getPricePrefix);

export const getPriceSuffix = createSelector(getPricingState, getFrequency, fromPricing.getPriceSuffix);

/*
 * Step Reducers
 */

export const getStepState = createFeatureSelector<fromStep.State>('step');

export const getSteps = createSelector(getStepState, fromStep.getSteps);

export const getCompletedSteps = createSelector(getStepState, fromStep.getCompletedSteps);

export const getCurrentStep = createSelector(getStepState, fromStep.getCurrentStep);

export const getNextStep = createSelector(getStepState, fromStep.getNextStep);

export const getPreviousStep = createSelector(getStepState, fromStep.getPreviousStep);

export const getShowLiveChat = createSelector(getStepState, fromStep.getShowLiveChat);

/*
 * Section Card Reducers
 */

export const getCardState = createFeatureSelector<fromCard.State>('card');

export const getCardStatus = createSelector(getCardState, fromCard.getCardStatus);

export const getOpenCard = createSelector(getCardState, fromCard.getOpenCard);

export const getVisibleCards = createSelector(getCardState, fromCard.getCardsVisible);

export const getCards = createSelector(getCardState, fromCard.getCards);

export const getCardsVisibleOrReadonly = createSelector(getCardState, fromCard.getCardsVisibleOrReadonly);

export const getCompletedCards = createSelector(getCardState, fromCard.getCompletedCards);

/*
 * Consent Reducers
 */

export const getConsentState = createFeatureSelector<fromConsent.State>('consent');

export const getConsent = createSelector(getConsentState, fromConsent.getConsent);

export const getMarketingConsent = createSelector(getConsentState, fromConsent.getMarketingConsent);

export const getPaperlessConsent = createSelector(getConsentState, fromConsent.getPaperlessConsent);

/*
 * Cover Reducers
 */

export const getCoverState = createFeatureSelector<fromCover.State>('cover');

export const getCover = createSelector(getCoverState, fromCover.getCover);

export const getCoverStartDate = createSelector(getCoverState, fromCover.getCoverStartDate);

/*
 * Payment Reducers
 */

export const getPaymentState = createFeatureSelector<fromPayment.State>('payment');

export const getPayment = createSelector(getPaymentState, fromPayment.getPayment);

export const getPaymentOptions = createSelector(getPaymentState, fromPayment.getPaymentOptions);

export const getRetry = createSelector(getPaymentState, fromPayment.getRetry);

export const getRealexModel = createSelector(getPaymentState, fromPayment.getRealexModel);

export const getIframeLoading = createSelector(getPaymentState, fromPayment.getIframeLoading);

export const getCollectionDate = createSelector(getPaymentState, fromPayment.getCollectionDate);

export const getPaymentValidationErrors = createSelector(getPaymentState, fromPayment.getPaymentValidationErrors);

export const getCanChangePaymentFrequency = createSelector(getPaymentState, fromPayment.getCanChangePaymentFrequency);

/*
 * Dialogs Reducers
 */

export const getDialogsState = createFeatureSelector<fromDialogs.State>('dialogs');

export const getDialogs = createSelector(getDialogsState, fromDialogs.getDialogs);
export const getIsDialogOpen = createSelector(getDialogsState, fromDialogs.getIsDialogOpen);

/*
 * Validation reducers
 */

export const getValidationState = createFeatureSelector<fromValidation.State>('validation');

export const getForceShowValidationErrors = createSelector(getValidationState, fromValidation.getForceShowValidationErrors);

export const getErrorState = createFeatureSelector<fromError.State>('error');

/*
 * Session Reducers
 */

export const getSessionState = createFeatureSelector<fromSession.State>('session');

export const getSession = createSelector(getSessionState, fromSession.getSession);
export const getSessionExpiry = createSelector(getSessionState, fromSession.getSessionExpiry);

/*
 * Questions Reducers
 */

export const getQuestionsState = createFeatureSelector<fromQuestions.State>('questions');

export const getAllQuestions = createSelector(getQuestionsState, fromQuestions.getAllQuestions);

export const getCanChangeQuestion = createSelector(getQuestionsState, fromQuestions.getCanChangeQuestion);

/*
 * Loading reducers
 */

export const getLoadingState = createFeatureSelector<fromLoading.ILoadingState>('loading');

/*
 * Eagle Eye reducers
 */

export const getEagleEyeState = createFeatureSelector<fromEagleEye.State>('eagleEye');
export const getEagleEyeTokenValue = createSelector(getEagleEyeState, fromEagleEye.getEagleEyeTokenValue);
