
import cookie from 'react-cookies';
import axios from "axios";


export function buildInspectorPath(uploadID, pageID, artboardID, artboardTitle, suffix='') {
	return ('/page/' + uploadID + '/' + pageID + '/' + artboardID + '/' + convertURLSlug(artboardTitle) + suffix);
}

export function buildInspectorURL(uploadID, pageID, artboardID, artboardTitle, suffix='') {
	return (window.location.origin + buildInspectorPath(uploadID, pageID, artboardID, artboardTitle, suffix));
}

export function buildProjectPath(uploadID, title, suffix='') {
	return ('/proj/' + uploadID + '/' + convertURLSlug(title) + suffix);
}

export function buildProjectURL(uploadID, title, suffix='') {
	return (window.location.origin + buildProjectPath(uploadID, title, suffix));
}

export function capitalizeText(text, toLower=false) {
	return ((toLower) ? text.toLowerCase().replace(/(\b\w)/gi, function(c) { return (c.toUpperCase()); }) : text.replace(/(\b\w)/gi, function(c) { return (c.toUpperCase()); }));
}

export function convertURLSlug(text) {
	return (text.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
}

export function copyTextToClipboard(text) {
// 	navigator.clipboard.writeText(text);

	const textField = document.createElement('textarea');
	textField.innerText = text;
	document.body.appendChild(textField);
	textField.select();
	document.execCommand('copy');
	textField.remove();
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

export function limitString(str='', len) {
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

export function sendToSlack(message, callback=null) {
	let formData = new FormData();
	formData.append('action', 'SLACK');
	formData.append('message', message);
	axios.post('https://api.designengine.ai/system.php', formData)
		.then((response) => {
			console.log("SLACK", response.data);
			if (callback) {
				callback();
			}
		}).catch((error) => {
	});
}
