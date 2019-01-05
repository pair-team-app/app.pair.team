
import ReactGA from 'react-ga';

export function initTracker(userID) {
ReactGA.initialize('UA-74998463-1', {
// 		debug     : true,
		titleCase : false,
		gaOptions : { userId : userID }
	});
}

export function trackPageview() {
	ReactGA.pageview(window.location.pathname + window.location.search);
}

export function trackEvent(category, action, label, value, nonInteraction) {
	nonInteraction = (nonInteraction || false);
	ReactGA.event({ category, action, label, value, nonInteraction });
}
