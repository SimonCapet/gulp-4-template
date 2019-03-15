import { NgModule } from '@angular/core';

import { ToPoundsPipe } from 'shared/pipes/to-pounds.pipe';
import { SafeHtmlPipe } from 'shared/pipes/safe-html.pipe';
import { OrdinalPipe } from 'shared/pipes/ordinal.pipe';

export const PIPES = [ToPoundsPipe, SafeHtmlPipe, OrdinalPipe];

@NgModule({
	declarations: PIPES,
	exports: PIPES,
})
export class PipesModule {}
