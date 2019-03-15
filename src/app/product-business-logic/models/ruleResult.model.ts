import { MoreInfoMode } from 'pbl/enums';

export interface IRuleResult {
	valid: boolean;
	productsToDeselect?: string[];
	moreInfoMode?: MoreInfoMode;
}
