export function calculateAgeInYears(DOB: Date, onDate = new Date()): number {
	const onDateYear = onDate.getFullYear();
	const DOBYear = DOB.getFullYear();
	let yearDiff = onDateYear - DOBYear;
	const dateOnDate = new Date(onDateYear, DOB.getMonth(), DOB.getDate());

	if (dateOnDate > onDate) {
		yearDiff--;
	}

	return yearDiff;
}
