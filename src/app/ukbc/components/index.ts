import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from 'ukbc/components/header-bar/header/header.component';
import { PaymentFrequencyToggleComponent } from 'ukbc/components/payment-frequency/payment-frequency-toggle.component';
import { PaymentFrequencyButtonsComponent } from 'ukbc/components/payment-frequency/payment-frequency-buttons.component';
import { PaymentFrequencyRadioButtonsComponent } from 'ukbc/components/payment-frequency/payment-frequency-radio-buttons.component';
import { BasketItemsComponent } from 'ukbc/components/basket/basket-items.component';
import { BasketPriceComponent } from 'ukbc/components/basket/basket-price.component';
import { BasketTokenComponent } from 'ukbc/components/basket/basket-token.component';
import { ProgressBarStepsComponent } from 'ukbc/components/header-bar/progress-bar-steps/progress-bar-steps.component';
import { DetailsMembersComponent } from 'ukbc/components/details/people/members.component';
import { DetailsPersonComponent } from 'ukbc/components/details/people/person.component';
import { DetailsAddressComponent } from 'ukbc/components/details/people/address.component';
import { DetailsVehicleComponent } from 'ukbc/components/details/vehicles/vehicle.component';
import { DetailsVehiclesComponent } from 'ukbc/components/details/vehicles/vehicles.component';
import { StepTitleComponent } from 'ukbc/components/step/title.component';
import { PaymentCoverStartDateComponent } from 'ukbc/components/cover-start-date/cover-start-date.component';
import { PaymentCoverStartDateButtonsComponent } from 'ukbc/components/cover-start-date/cover-start-date-buttons.component';
import { DirectDebitDetailsComponent } from 'ukbc/components/payment/direct-debit-details.component';
import { PaymentFrequencyComponent } from 'ukbc/components/payment/payment-frequency.component';
import { PaymentFrequencyDurationButtonsComponent } from 'ukbc/components/payment-frequency/payment-frequency-duration-buttons.component';
import { PaymentFrequencyDurationComponent } from 'ukbc/components/payment-frequency/payment-frequency-duration.component';
import { PaymentFrequencyDurationMessageComponent } from 'ukbc/components/payment-frequency/payment-frequency-duration-message.component';
import { PaymentDetailsComponent } from 'ukbc/components/payment/payment-details.component';
import { InstalmentDatePickerComponent } from 'ukbc/components/payment/instalment-date-picker.component';
import { PaymentMethodComponent } from 'ukbc/components/payment/method.component';
import { PaymentCardComponent } from 'ukbc/components/payment/card.component';
import { DirectDebitTermsComponent } from 'ukbc/components/payment/direct-debit-terms.component';
import { ChatNowComponent } from 'ukbc/components/chat-now/chat-now.component';
import { CoverCheckComponent } from 'ukbc/components/payment/cover-check.component';
import { CollectionDateComponent } from 'ukbc/components/collection-date/collection-date.component';
import { QuestionComponent } from 'ukbc/components/question/question.component';
import { QuestionProgressComponent } from 'ukbc/components/question/question-progress.component';
import { SummaryProductComponent } from 'ukbc/components/summary-product/summary-product.component';
import { CardInformationComponent } from 'ukbc/components/payment/card-information.component';
import { TermsAndConditionsComponent } from 'ukbc/components/terms-and-conditions/terms-and-conditions.component';
import { MonthlyCardCollectionDateComponent } from 'ukbc/components/collection-date/monthly-card-collection-date.component';

import { PipesModule } from 'shared/pipes';
import { SharedComponentsModule } from 'shared/components';
import { PriceComponent } from 'ukbc/components/price/price.component';

export const COMPONENTS = [
	HeaderComponent,
	BasketItemsComponent,
	BasketPriceComponent,
	BasketTokenComponent,
	SummaryProductComponent,
	ProgressBarStepsComponent,
	DetailsMembersComponent,
	DetailsPersonComponent,
	DetailsAddressComponent,
	DetailsVehicleComponent,
	DetailsVehiclesComponent,
	StepTitleComponent,
	PaymentMethodComponent,
	PaymentCoverStartDateComponent,
	PaymentCoverStartDateButtonsComponent,
	DirectDebitDetailsComponent,
	PaymentFrequencyToggleComponent,
	PaymentFrequencyButtonsComponent,
	PaymentFrequencyRadioButtonsComponent,
	PaymentFrequencyComponent,
	PaymentFrequencyDurationButtonsComponent,
	PaymentFrequencyDurationMessageComponent,
	PaymentFrequencyDurationComponent,
	PaymentDetailsComponent,
	InstalmentDatePickerComponent,
	PaymentCardComponent,
	DirectDebitTermsComponent,
	CardInformationComponent,
	ChatNowComponent,
	CoverCheckComponent,
	CollectionDateComponent,
	MonthlyCardCollectionDateComponent,
	QuestionComponent,
	QuestionProgressComponent,
	PriceComponent,
	TermsAndConditionsComponent,
];

@NgModule({
	imports: [CommonModule, RouterModule, PipesModule, SharedComponentsModule],
	declarations: COMPONENTS,
	exports: COMPONENTS,
})
export class ComponentsModule {}
