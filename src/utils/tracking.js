
import cookie from 'react-cookies';
import ReactGA from 'react-ga';


const UA_TRACKING_ID = 'UA-133040806-1';
const DEBUG = false;


export function initTracker(userID) {
	console.log('::::]]', 'initTracker', userID);

	ReactGA.initialize(UA_TRACKING_ID, {
		debug     : DEBUG,
		titleCase : false,
		gaOptions : { userId : userID }
	});
}

export function trackEvent(category, action, label=window.location.pathname, value=null, nonInteraction=false) {
	label = (label || window.location.pathname);
	value = (value || ((typeof cookie.load('user_id') !== 'undefined') ? cookie.load('user_id') : '0')) << 0;
	console.log('::::]]', 'trackEvent', category, action, label, value, nonInteraction);

	ReactGA.event({ category, action, label, value, nonInteraction });
}

export function trackOverlay(params) {
	console.log('::::]]', 'trackOverlay', params);

	const type = params.split('/').slice().shift();
	const source = params.split('/').slice().pop();

	trackEvent('modal', type, source);
}

export function trackPageview(uri=`${window.location.pathname}${window.location.search}`) {
	console.log('::::]]', 'trackPageview', uri);
	ReactGA.pageview(uri);
}
