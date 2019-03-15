import { UAParser } from 'ua-parser-js';

const ua = new UAParser();
const classList = document.body.classList;

function setClientClasses() {
	const device = ua.getDevice();
	const os = ua.getOS();
	const browser = ua.getBrowser();

	if (device.type) {
		classList.add(device.type);
	}

	classList.add(os.name.replace(/ /g, '-'));
	classList.add(browser.name.replace(/ /g, '-'));
}

setClientClasses();
