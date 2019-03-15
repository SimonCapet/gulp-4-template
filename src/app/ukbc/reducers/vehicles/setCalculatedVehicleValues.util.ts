import { sortBy } from 'sort-by-typescript';
import { Vehicle, EVehicleRule } from 'shared/models';

export function SetCalculateVehicleValues(vehicle: Vehicle): Vehicle {
	if (vehicle.Year) {
		vehicle.Age = Math.round(new Date().getFullYear() - vehicle.Year);
	} else {
		vehicle.Age = null;
	}

	const productAgeRule = vehicle.ProductRules.filter(rules => !!rules[EVehicleRule.MaxAge]).sort(sortBy('-Value'))[0];

	if (productAgeRule) {
		vehicle.AgeRule = productAgeRule[EVehicleRule.MaxAge];
	} else {
		vehicle.AgeRule = null;
	}

	const productMileageRule = vehicle.ProductRules.filter(rules => !!rules[EVehicleRule.MaxMileage]).sort(sortBy('-Value'))[0];

	if (productMileageRule) {
		vehicle.MileageRule = productMileageRule[EVehicleRule.MaxMileage];
	} else {
		vehicle.MileageRule = null;
	}

	const productFuelTypeRule = vehicle.ProductRules.find(rules => !!rules[EVehicleRule.FuelType]);

	if (productFuelTypeRule) {
		vehicle.FuelRule = productFuelTypeRule[EVehicleRule.FuelType];
	} else {
		vehicle.FuelRule = null;
	}

	vehicle.RequestMileage = !!vehicle.MileageRule;

	vehicle.RequestFuel = !!vehicle.FuelRule;

	if (!vehicle.RequestMileage) {
		vehicle.Mileage = null;
	}

	if (!vehicle.RequestFuel) {
		vehicle.Fuel = null;
	}

	return vehicle;
}
