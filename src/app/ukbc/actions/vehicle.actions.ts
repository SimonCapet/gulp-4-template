import { Action } from '@ngrx/store';
import { Vehicle, IVehicleFields, IAddRemoveVehiclePayload, IVehicleState } from 'ukbc/models';

export const AUTOMATICALLY_ADD_VEHICLE = '[Vehicles] Automatically add vehicle';
export const AUTOMATICALLY_REMOVE_VEHICLE = '[Vehicles] Automatically remove vehicle';
export const SET_PRODUCT_RULES_FOR_VEHICLE = '[Vehicles] Set product rules for vehicle';
export const SET_VEHICLE_FIELD = '[Vehicles] Set field';
export const VEHICLE_LOOKUP_COMPLETE = '[Vehicles] Lookup Complete';
export const MARK_LOOKUP_UNCOMPLETED = '[Vehicles] Mark lookup uncompleted';
export const SET_VEHICLE_MANUAL_EDIT = '[Vehicles] Set vehicle manual edit';

export const OPEN_VEHICLE = '[Vehicles] Open vehicle';
export const SET_VEHICLE_DETAILS = '[Vehicles] Set vehicle details';
export const COMPLETE_VEHICLE = '[Vehicles] Complete vehicle';

export class AutomaticallyAddVehicle implements Action {
	readonly type = AUTOMATICALLY_ADD_VEHICLE;
	constructor(public payload: IAddRemoveVehiclePayload) {}
}

export class AutomaticallyRemoveVehicle implements Action {
	readonly type = AUTOMATICALLY_REMOVE_VEHICLE;
}

export class SetProductRulesForVehicle implements Action {
	readonly type = SET_PRODUCT_RULES_FOR_VEHICLE;
	constructor(public payload: IAddRemoveVehiclePayload) {}
}

export class SetVehicleField implements Action {
	readonly type = SET_VEHICLE_FIELD;
	constructor(public payload: IVehicleFields) {}
}

export class MarkLookupUncompleted implements Action {
	readonly type = MARK_LOOKUP_UNCOMPLETED;
	constructor(public payload: IVehicleState) {}
}

export class SetVehicleManualEdit implements Action {
	readonly type = SET_VEHICLE_MANUAL_EDIT;
	constructor(public payload: { id: string; manualEdit: boolean }) {}
}

export class OpenVehicle implements Action {
	readonly type = OPEN_VEHICLE;
	constructor(public payload: { id: string }) {}
}

export class SetVehicleDetails implements Action {
	readonly type = SET_VEHICLE_DETAILS;
	constructor(public payload: Vehicle) {}
}

export class CompleteVehicle implements Action {
	readonly type = COMPLETE_VEHICLE;
	constructor(public payload: { id: string }) {}
}

export type Actions =
	| AutomaticallyAddVehicle
	| AutomaticallyRemoveVehicle
	| SetProductRulesForVehicle
	| SetVehicleField
	| MarkLookupUncompleted
	| SetVehicleManualEdit
	| OpenVehicle
	| SetVehicleDetails
	| CompleteVehicle;
