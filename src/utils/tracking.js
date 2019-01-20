
import cookie from "react-cookies";
import ReactGA from 'react-ga';


const UA_ID = 'UA-74998463-1';


export function initTracker(userID) {
ReactGA.initialize(UA_ID, {
// 		debug     : true,
		titleCase : false,
		gaOptions : { userId : userID }
	});
}

export function trackEvent(category, action, label=null, value=null, nonInteraction=false) {
	label = (label || ((typeof cookie.load('username') !== 'undefined') ? cookie.load('username') : ''));
	value = parseInt(value || ((typeof cookie.load('user_id') !== 'undefined') ? cookie.load('user_id') : '0'), 10);

	ReactGA.event({ category, action, label, value, nonInteraction });
}

export function trackModal(type) {
	ReactGA.pageview(`${window.location.pathname}/${type}`);
}

export function trackPageview() {
	ReactGA.pageview(`${window.location.pathname}${window.location.search}`);
}
