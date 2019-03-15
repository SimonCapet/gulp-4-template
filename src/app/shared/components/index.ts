import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextComponent } from 'shared/components/input/text.component';
import { InputSelectComponent } from 'shared/components/input/select.component';
import { InputDateComponent } from 'shared/components/input/date.component';
import { InputSortCodeComponent } from 'shared/components/input/sort-code.component';
import { InputAddressComponent } from 'shared/components/address/address.component';
import { InputAddressPickerComponent } from 'shared/components/address/address-picker.component';
import { InputManualAddressComponent } from 'shared/components/address/manual-address.component';
import { InputVehicleComponent } from 'shared/components/vehicle/vehicle.component';
import { NumberPickerComponent } from 'shared/components/input/number-picker.component';

import { HttpService, AddressService } from 'shared/services';

export const COMPONENTS = [
	InputTextComponent,
	InputSelectComponent,
	InputDateComponent,
	InputAddressComponent,
	InputAddressPickerComponent,
	InputVehicleComponent,
	InputManualAddressComponent,
	InputSortCodeComponent,
	NumberPickerComponent,
];

@NgModule({
	imports: [CommonModule, FormsModule],
	declarations: COMPONENTS,
	exports: COMPONENTS,
	providers: [HttpService, AddressService],
})
export class SharedComponentsModule {}
