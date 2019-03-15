export function SetDirectDebitField(stateCopy, payload) {
	stateCopy[payload.field] = payload.value;
	return stateCopy;
}
