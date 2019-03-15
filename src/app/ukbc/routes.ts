import { Routes, Route } from '@angular/router';
import { QuestionsComponent } from 'ukbc/containers/questions/questions.component';
import { SummaryComponent } from 'ukbc/containers/summary/summary.component';
import { DetailsPaymentComponent } from 'ukbc/containers/checkout/details-payment.component';
import { ErrorComponent } from 'ukbc/components/error/error.component';
import { IInitialState } from 'ukbc/models';
import { StepGuard } from 'ukbc/services';
import { EStepType } from 'ukbc/enums';
const initialstate: IInitialState = (<any>window).UKBC_initialState;
const Steps = initialstate.ContentInformation.Journey.Steps;

// Map step types to Angular components
const COMPONENT_MAP: { [T in EStepType]: object } = {
	questions: QuestionsComponent,
	summary: SummaryComponent,
	detailsandpayment: DetailsPaymentComponent,
};

export function getComponentForStep(name: string) {
	return COMPONENT_MAP[name];
}

// Helper function to build routes array
export function buildRouteSteps(step): Route {
	return {
		path: step.Url,
		component: getComponentForStep(step.Type),
		canActivate: [StepGuard],
		data: {
			questions: step.Questions,
			products: step.Products,
			multiProducts: step.MultiProductsList,
			selectorStyle: 'standard',
			type: step.Type,
			AnalyticsPageId: step.AnalyticsPageId,
		},
	};
}

// Initialise routes as an empty array to stop Webpack from whinging about undefined routes
export let routeSteps = [];

// Build routes array from steps payload
routeSteps = Steps.map(buildRouteSteps);

// Add static routes
routeSteps.push({
	path: 'error',
	component: ErrorComponent,
});

// redirect to the first step if url is set
if (Steps[0].Url) {
	routeSteps.push({
		path: '',
		redirectTo: '/' + Steps[0].Url + getQueryStringFromInitialState(Steps[0].Url),
		pathMatch: 'full',
	});
	routeSteps.push({
		path: '**',
		redirectTo: '/' + Steps[0].Url + getQueryStringFromInitialState(Steps[0].Url),
		pathMatch: 'full',
	});
} else {
	routeSteps.push({
		path: '**',
		redirectTo: '/',
		pathMatch: 'full',
	});
}

export function getQueryStringFromInitialState(url: string): string {
	if (!initialstate.QueryString) {
		return '';
	}
	if (url.includes('?')) {
		return '&' + initialstate.QueryString;
	}

	return '?' + initialstate.QueryString;
}

export const routes: Routes = [
	{
		path: '',
		children: routeSteps,
	},
];
