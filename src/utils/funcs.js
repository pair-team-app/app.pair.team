
import cookie from 'react-cookies';
import axios from 'axios';

import {
	HOME,
	COLORS,
// 	EXPLORE,
	FONTS,
	INSPECT,
	LOGIN,
	PARTS,
// 	PRIVACY,
	PROFILE,
// 	RECOVER,
	REGISTER,
// 	TERMS,
	UPLOAD
} from '../consts/uris';


export function buildInspectorPath(upload, prefix=null, suffix='') {
	prefix = (prefix || `/${window.location.pathname.substr(1).split('/').shift()}`);
	return (`${prefix}/${upload.id}/${convertURISlug(upload.title)}${suffix}`);
}

export function buildInspectorURL(upload, prefix=null, suffix='') {
	return (`${window.location.origin}${buildInspectorPath(upload, prefix, suffix)}`);
}

export function camilzeText(text, separator=' ', first=false) {
	separator = (separator || ' ');

	const camilized = text.split(separator).map((word)=> (word.replace(/^./, (c)=> (c.toUpperCase())))).join('');
	return ((first) ? camilized : camilized.replace(/^./, (c)=> (c.toLowerCase())));
}

export function capitalizeText(text, toLower=false) {
	text = (toLower) ? text.toLowerCase() : text;
	return (text.replace(/(\b\w)/gi, (c)=> (c.toUpperCase())));
}

export function convertURISlug(text) {
	return (text.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
}

export function copyTextToClipboard(text) {
// 	navigator.clipboard.writeText(text);

	const txtArea = document.createElement('textarea');
	txtArea.innerText = text;
	document.body.appendChild(txtArea);
	txtArea.select();
	document.execCommand('copy');
	txtArea.remove();
}

export function className(obj) {
	return (obj.constructor.name);
}

export function frameToRect(frame) {
	return ({
		top    : frame.origin.y,
		left   : frame.origin.x,
		bottom : frame.origin.y + frame.size.height,
		right  : frame.origin.x + frame.size.width
	});
}

export function hasBit(val, bit) {
	return ((val & bit) === bit);
}

export function hideText(text, char='*') {
	return ((text.length > 0) ? Array(text.length + 1).join(char) : '');
}

export function idsFromPath() {
	const { pathname } = window.location;
	const inspectorPath = /\/(?:inspect|colors|parts|typography)\/(\d+)\/.+$/;

	const navIDs = {
		uploadID   : (inspectorPath.test(pathname)) ? pathname.match(inspectorPath)[1] : 0,
		pageID     : 0,
		artboardID : 0,
		sliceID    : 0
	};

	return (navIDs);
}

export function isHomePage() {
	const { pathname } = window.location;
	return (pathname === '' || pathname === HOME);
}

export function isInspectorPage() {
	const { pathname } = window.location;
	return ((pathname.includes(INSPECT + '/') || pathname.includes(COLORS + '/') || pathname.includes(FONTS + '/') || pathname.includes(PARTS + '/')) && /^.+\/\d+\/.+$/.test(pathname));
}

export function isLoginPage(exact=false) {
	const { pathname } = window.location;
	return ((exact) ? pathname === LOGIN : pathname.includes(LOGIN));
}

export function isProfilePage(exact=false) {
	const { pathname } = window.location;
	return ((exact) ? pathname === PROFILE : pathname.includes(PROFILE));
}

export function isRegisterPage(exact=false) {
	const { pathname } = window.location;
	return ((exact) ? pathname === REGISTER : pathname.includes(REGISTER));
}

export function isUploadPage(exact=false) {
	const { pathname } = window.location;
	return ((exact) ? pathname === UPLOAD : pathname.includes(UPLOAD));
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

export function makeDownload(url) {
	let link = document.createElement('a');
	link.target = '_blank';
	link.href = url;
	link.download = url.split('/').pop();
	link.click();
	link.remove();
}

export function numberedName(name, list, divider='_') {
	if (list[name].length === 0) {
		list[name] = 0;
	}

	return ({
		name : `${name}${divider}${++list[name]}`,
		list : list
	});
}

export function isEmptyArray(arr) {
	return (arr.length === 0);
}

export function isEmptyObject(obj) {
	return (Object.keys(obj).length === 0);
}

export function randomElement(array) {
	return ((array.length > 0) ? array.slice(randomInt(0, array.length), 1).pop() : null);
}

export function randomFloat(lower, upper) {
	return ((Math.random() * (upper - lower)) + lower);
}

export function randomInt(lower, upper) {
	return (Math.floor(randomFloat(lower, upper)));
}

export function rectContainsRect(baseRect, testRect) {
	return (baseRect.top <= testRect.top && baseRect.left <= testRect.left && baseRect.right >= testRect.right && baseRect.bottom >= testRect.bottom);
}

export function rectIntersectsRect(baseRect, testRect) {
	return (Math.max(baseRect.left, testRect.left) < Math.min(baseRect.right, testRect.right) && Math.max(baseRect.top, testRect.top) < Math.min(baseRect.bottom, testRect.bottom));
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
