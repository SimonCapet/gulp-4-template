export function debounce(func: Function, wait: number, immediate?: boolean) {
	let timeout, args, context, timestamp, result;

	if (wait === null) {
		wait = 100;
	}

	function later() {
		const last = Date.now() - timestamp;

		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate) {
				result = func.apply(context, args);
				context = args = null;
			}
		}
	}

	return function() {
		context = this;
		args = arguments;
		timestamp = Date.now();

		const callNow = immediate && !timeout;

		if (!timeout) {
			timeout = setTimeout(later, wait);
		}

		if (callNow) {
			result = func.apply(context, args);
			context = args = null;
		}

		return result;
	};
}
