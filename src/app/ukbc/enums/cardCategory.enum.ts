export enum ECardCategory {
	Details = 'Details',
	Payment = 'Payment',
}

export const cardCategorySortOrder: { [category in ECardCategory]: number } = {
	Details: 0,
	Payment: 1,
};
