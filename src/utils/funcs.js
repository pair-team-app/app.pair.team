
import cookie from 'react-cookies';

export function capitalizeText(text, toLower) {
	toLower = (toLower || false);
	return ((toLower) ? text.toLowerCase().replace(/(\b\w)/gi, function(c) { return (c.toUpperCase()); }) : text.replace(/(\b\w)/gi, function(c) { return (c.toUpperCase()); }));
}

export function className(obj) {
	return (obj.constructor.name);
}

export function hasBit(val, bit) {
	return ((val & bit) === bit);
}

export function hideText(text, char='*') {
	return (Array(text.length + 1).join(char));
}

export function idsFromPath() {
	const pathname = window.location.pathname;
	const artboardPath = /\/artboard|page\/\d+\/\d+\/\d+\/.*$/;
	const projPath = /\/proj\/\d+\/.*$/;

	return ({
		uploadID   : (artboardPath.test(pathname)) ? pathname.match(/\/artboard|page\/(\d+)\/.*$/)[1] : (projPath.test(pathname)) ? pathname.match(/\/proj\/(\d+)\/.*$/)[1] : 0,
		pageID     : (artboardPath.test(pathname)) ? pathname.match(/\/artboard|page\/\d+\/(\d+)\/.*$/)[1] : 0,
		artboardID : (artboardPath.test(pathname)) ? pathname.match(/\/artboard|page\/\d+\/\d+\/(\d+)\/.*$/)[1] : 0,
		sliceID    : 0
	});
}

export function isExplorePage() {
	return (window.location.pathname.includes('/explore'));
}

export function isHomePage() {
	return (window.location.pathname === '' || window.location.pathname === '/');
}

export function isInspectorPage() {
	return (window.location.pathname.includes('/artboard') || window.location.pathname.includes('/page'));
}

export function isProjectPage() {
	return (window.location.pathname.includes('/proj'));
}

export function isUploadPage() {
	return (window.location.pathname.includes('/new'));
}

export function isUserLoggedIn() {
	return (cookie.load('user_id') !== '0');
}

export function isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return (re.test(String(email).toLowerCase()));
}

export function limitString(str, len) {
	str = (str || '');
	return ((str.length > len) ? str.substr(0, len - 1) + '…' : str);
}

export function randomElement(array) {
	return ((array.length > 0) ? array[randomInt(0, array.length)] : null);
}

export function randomFloat(lower, upper) {
	return ((Math.random() * (upper - lower)) + lower);
}

export function randomInt(lower, upper) {
	return (Math.floor(randomFloat(lower, upper)));
}

export function scrollOrigin(element) {
	if (element) {
		element.scrollTo(0, 0);
	}
}

export function urlSlugTitle(text) {
	return (text.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
}