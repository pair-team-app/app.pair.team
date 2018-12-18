
import ReactPixel from "react-facebook-pixel";

export function initTracker(email) {
	email = (email || 'tracking@designengine.ai');
	const options = {
		autoConfig : true,
		debug      : false
	};

	ReactPixel.init('318191662273348', { em : email }, options);
}

export function trackEvent(name) {
	ReactPixel.trackCustom(name);
}
