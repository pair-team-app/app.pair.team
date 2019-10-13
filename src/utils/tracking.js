
import cookie from 'react-cookies';
import ReactGA from 'react-ga';


const UA_TRACKING_ID = 'UA-149949677-1';
const DEBUG = false;


export function initTracker(userID) {
	console.log('::::]]', 'initTracker', userID);

	ReactGA.initialize(UA_TRACKING_ID, {
		debug     : DEBUG,
		titleCase : false,
		gaOptions : { userId : userID }
	});
}

export function trackError(error, fatal=false) {
	console.log('::::]]', 'trackError()', error, fatal);
	ReactGA.exception({ fatal,
		description : error,
	});
}

export function trackEvent(category, action, label=window.location.pathname, value=null, nonInteraction=false) {
	label = (label || window.location.pathname);
	value = (value || ((typeof cookie.load('user_id') !== 'undefined') ? cookie.load('user_id') : '0')) << 0;
	console.log('::::]]', 'trackEvent()', category, action, label, value, nonInteraction);

	ReactGA.event({ category, action, label, value, nonInteraction });
}

export function trackOverlay(params) {
// 	console.log('::::]]', 'trackOverlay', params);

	const type = params.split('/').slice().shift();
	const source = params.split('/').slice().pop();

	trackEvent('modal', type, source);
}

export function trackPageview(uri=`${window.location.pathname}${window.location.search}`) {
	const pageURI = (uri.replace(/^\//, '').length === 0) ? '/' : uri.replace(/^\//, '');

	console.log('::::]]', 'trackPageview()', pageURI);
	ReactGA.pageview(pageURI);
}

export function trackOutbound(url, callback=null) {
	console.log('::::]]', 'trackOutbound()', url, callback);
	ReactGA.outboundLink({ label : url }, callback);
}
