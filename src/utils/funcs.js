
import cookie from 'react-cookies';
import axios from 'axios';

import {
	HOME,
	INSPECT,
	LOGIN,
	PARTS,
	PRESENT,
// 	PRIVACY,
	PROFILE,
// 	RECOVER,
	REGISTER,
// 	TERMS,
	UPLOAD,
	API_URL } from '../consts/uris';
import { Strings } from './lang';



export function buildInspectorPath(upload, prefix='/inspect', suffix='') {
	return (`${Strings.trimSlash(prefix)}/${upload.id}/${Strings.uriSlug(upload.title)}${Strings.trimSlash(suffix)}`);
}

export function buildInspectorURL(upload, prefix='/inspect', suffix='') {
	return (`${window.location.origin}${buildInspectorPath(upload, prefix, suffix)}`);
}

export function idsFromPath() {
	const { pathname } = window.location;
	const inspectorPath = /\/(?:inspect|parts|present)\/(\d+)\/.+$/i;

	const navIDs = {
		uploadID   : ((inspectorPath.test(pathname)) ? pathname.match(inspectorPath)[1] : 0) << 0,
		pageID     : 0 << 0,
		artboardID : 0 << 0,
		sliceID    : 0 << 0
	};

	return (navIDs);
}

export function isHomePage(root=true) {
	const { pathname } = window.location;
	return ((root) ? (pathname === '' || pathname === HOME) : (pathname === '' || pathname === HOME || pathname === INSPECT || pathname === PARTS));
}

export function isInspectorPage() {
	const { pathname } = window.location;
	return ((pathname.includes(`${INSPECT}/`) || pathname.includes(`${PARTS}/`) || pathname.includes(`${PRESENT}/`)) && /^.+\/\d+\/.+$/.test(pathname));
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

export function sendToSlack(message, callback=null) {
	let formData = new FormData();
	formData.append('action', 'SLACK');
	formData.append('message', message);
	axios.post(API_URL, formData)
		.then((response) => {
			console.log("SLACK", response.data);
			if (callback) {
				callback();
			}
		}).catch((error) => {
	});
}
