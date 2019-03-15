import { IVehicleState } from 'shared/models';

export function RemoveVehicleAtIndex(state: IVehicleState[]): IVehicleState[] {
	// Create fresh vehicles array to ensure our reducers run in an immutable way
	const vehicles = [...state];
	// Remove last vehicle in array.
	return vehicles.slice(0, -1);
}
