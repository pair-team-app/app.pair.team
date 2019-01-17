
import cookie from 'react-cookies';
import axios from 'axios';

import {
// 	ADD_ONS,
// 	API,
	HOME,
	COLORS,
	EXPLORE,
	FONTS,
	INSPECT,
// 	LOGIN,
// 	MISSION,
	PARTS,
// 	PRIVACY,
	PROFILE,
// 	RECOVER,
// 	REGISTER,
// 	TERMS,
	UPLOAD
} from '../consts/pathnames';

export function buildInspectorPath(upload, prefix=null, suffix='') {
	prefix = (prefix || (`/${window.location.pathname.substr(1).split('/').shift()}`));
	return (`${prefix}/${upload.id}/${convertURLSlug(upload.title)}${suffix}`);
}

export function buildInspectorURL(upload, prefix=null, suffix='') {
	return (window.location.origin + buildInspectorPath(upload, prefix, suffix));
}

export function buildProjectPath(upload, prefix=null, suffix='') {
	return ('/proj/' + upload.id + '/' + convertURLSlug(upload.title) + suffix);
}

export function buildProjectURL(upload, prefix=null, suffix='') {
	return (window.location.origin + buildProjectPath(upload, prefix, suffix));
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

export function isExplorePage() {
	const { pathname } = window.location;
	return (pathname.includes(EXPLORE));
}

export function isHomePage() {
	const { pathname } = window.location;
	return (pathname === '' || pathname === HOME);
}

export function isInspectorPage() {
	const { pathname } = window.location;
	return ((pathname.includes(INSPECT + '/') || pathname.includes(COLORS + '/') || pathname.includes(FONTS + '/') || pathname.includes(PARTS + '/')) && /^.+\/\d+\/.+$/.test(pathname));
}

export function isProfilePage() {
	return (window.location.pathname.includes(PROFILE));
}

export function isProjectPage() {
	return (window.location.pathname.includes('/proj'));
}

export function isUploadPage(base=false) {
	const { pathname } = window.location;
	return ((base) ? pathname === UPLOAD : pathname.includes(UPLOAD));
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

export function numberedName(name, list) {
	if (list[name].length > 0) {
		const cnt = ++list[name];
		return ({
			name : `${name}_${cnt}`,
			list : list
		});

	} else {
		list[name] = 1;
		return ({
			name : `${name}_1`,
			list : list
		});
	}
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
