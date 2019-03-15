import { Action } from '@ngrx/store';
import { IStep } from 'ukbc/models';

export const SET_STEP_CURRENT = '[Step] Step current';
export const ACTIVATE_NEXT_STEP = '[Step] Activate next step';
export const SET_CURRENT_STEP_COMPLETED = '[Step] Set current step completed';

export class SetStepCurrent implements Action {
	readonly type = SET_STEP_CURRENT;
	constructor(public stepUrl: string) {}
}

export class ActivateNextStep implements Action {
	readonly type = ACTIVATE_NEXT_STEP;
	constructor() {}
}

export class SetCurrentStepCompleted implements Action {
	readonly type = SET_CURRENT_STEP_COMPLETED;
}

export type Actions = SetStepCurrent | ActivateNextStep | SetCurrentStepCompleted;
