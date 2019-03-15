export function UpdateRealex(stateCopy, data) {
	// matches pricing.model enum
	stateCopy.RealexModel = { ...stateCopy.RealexModel, ...data };
	return stateCopy;
}
