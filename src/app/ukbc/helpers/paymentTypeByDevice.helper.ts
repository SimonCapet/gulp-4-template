import { UAParser } from 'ua-parser-js';
const { Journey } = (<any>window).UKBC_initialState.ContentInformation;

export function useMonthlyAsDefault(): boolean {
	const ua = new UAParser();
	const device = ua.getDevice();

	switch (device.type) {
		case 'tablet':
			return Journey.MonthlyAsDefaultTablet;
		case 'mobile':
			return Journey.MonthlyAsDefaultMobile;
		default:
			return Journey.MonthlyAsDefaultDesktop;
	}
}
