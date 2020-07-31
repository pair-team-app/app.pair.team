
import cookie from 'react-cookies';
import ReactGA from 'react-ga';


const UA_TRACKING_ID_LOCAL = 'UA-149949677-1';
const UA_TRACKING_ID_DEV = 'UA-149949677-2';
const UA_TRACKING_ID_LIVE = 'UA-149949677-3';
// const DEBUG = true;
const DEBUG = false;

const openURL = (url)=> {
	window.open(url);
};

export function initTracker(userID, hostname) {
	console.log('::::]]', 'initTracker', userID, hostname);

	ReactGA.initialize((hostname.includes('localhost') || hostname.includes('192')) ? UA_TRACKING_ID_LOCAL : (hostname.includes('dev.pairurl.com') ? UA_TRACKING_ID_DEV : UA_TRACKING_ID_LIVE), {
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
// console.log('::::]]', 'trackEvent()', category, action, label, value, nonInteraction);

	// ReactGA.event({ category, action, label, value, nonInteraction });
}

export function trackOverlay(params) {
	console.log('::::]]', 'trackOverlay', params);

	const action = params.split('#').slice().shift();
	const type = params.split('#').slice().pop();

	trackEvent('modal', action, type);
}

export function trackPageview(uri=`${window.location.pathname}${window.location.search}`) {
	const pageURI = (uri.replace(/^\//, '').length === 0) ? '/' : uri.replace(/^\//, '');
//
	console.log('::::]]', 'trackPageview()', pageURI);
	ReactGA.pageview(pageURI);
}

export function trackOutbound(url, callback=openURL) {
	console.log('::::]]', 'trackOutbound()', url, callback);

	ReactGA.outboundLink({ label : url }, callback(url) );
	// callback(url);
}
