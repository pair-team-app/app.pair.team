

import axios from 'axios';
import Octokit from '@octokit/rest';
import cookie from 'react-cookies';
import { matchPath } from 'react-router-dom';

import {
	HOME,
	INSPECT,
	LOGIN,
	PARTS,
	PRESENT,
	PROFILE,
	RECOVER,
	REGISTER,
	UPLOAD,
	API_ENDPT_URL } from '../consts/uris';
import { Strings, URLs } from './lang';


export function getRouteParams(pathname) {
// 	console.log('_-_-_-_-_', 'getRouteParams()', pathname, '_-_-_-_-_', URLs.firstComponent(pathname));

	const loginPage = matchPath(pathname, {
		path : '/login'
	});

	const profilePage = matchPath(pathname, {
		path : '/profile/:userID?'
	});

	const uploadPage = matchPath(pathname, {
		path : '/new/:section?'
	});

	const registerPage = matchPath(pathname, {
		path : '/register/:inviteID?'
	});

	const inspectorPage = matchPath(pathname, {
		path : `/${URLs.firstComponent(pathname)}/:uploadID/:titleSlug`
	});

	const homePage = matchPath(pathname, {
		path : '/:section'
	});

// 	console.log(':::::::::::::', loginPage, profilePage, uploadPage, registerPage, inspectorPage, homePage);

	if (loginPage && loginPage.isExact) {
		return ({ ...loginPage,
			page : 'LOGIN'
		});
	}

	if (profilePage && profilePage.isExact) {
		return ({ ...profilePage,
			page   : 'PROFILE',
			userID : profilePage.params.userID << 0
		});
	}

	if (uploadPage && uploadPage.isExact) {
		return ({ ...uploadPage,
			page : 'UPLOAD'
		});
	}

	if (registerPage && registerPage.isExact) {
		return ({ ...registerPage,
			page     : 'REGISTER',
			inviteID : registerPage.params.inviteID << 0
		});
	}

	if (inspectorPage && inspectorPage.isExact) {
		return ({ ...inspectorPage,
			page     : 'INSPECTOR',
			uploadID : inspectorPage.params.uploadID << 0
		});
	}

	if (homePage && homePage.isExact) {
		return ({ ...homePage,
			page : 'HOME'
		});
	}
}


export function buildInspectorPath(upload, prefix='/inspect', suffix='') {
	return (`${Strings.trimSlashes(prefix)}/${upload.id}/${Strings.slugifyURI(upload.title)}${Strings.trimSlashes(suffix)}`);
}

export function buildInspectorURL(upload, prefix='/inspect', suffix='') {
	return (`${window.location.origin}${buildInspectorPath(upload, prefix, suffix)}`);
}

export function createGist(token, filename, contents, description, visible=true) {
	const payload = { description,
		public : visible,
		files  : {
			[filename] : {
				content : contents
			}
		}
	};

	new Octokit({ auth : token }).gists.create(payload).then((result)=> {
		console.log('CREATE_GIST ->', result);
	});
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
	return ((root) ? (pathname === '' || pathname === HOME) : (pathname === '' || pathname === HOME || pathname === INSPECT || pathname === PARTS || pathname === PRESENT));
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

export function isRecoverPage(exact=false) {
	const { pathname } = window.location;
	return ((exact) ? pathname === RECOVER : pathname.includes(RECOVER));
}

export function isRegisterPage(exact=false) {
	const { pathname } = window.location;
	return ((exact) ? pathname === REGISTER : pathname.includes(REGISTER));
}

export function isUploadPage(exact=false) {
	const { pathname } = window.location;
	return ((exact) ? pathname === UPLOAD : pathname.includes(UPLOAD));
}

export function isUserLoggedIn(confirmed=true) {
// 	return ((confirmed) ? cookie.load('user_id') !== '0' : typeof cookie.load('user_id') !== 'undefined');
	return ((confirmed) ? ((cookie.load('user_id') << 0) !== 0) : (typeof cookie.load('user_id') !== 'undefined') << 0 !== 0);
}

export function sendToSlack(message, callback=null) {
	let formData = new FormData();
	formData.append('action', 'SLACK');
	formData.append('message', message);
	axios.post(API_ENDPT_URL, formData)
		.then((response) => {
			console.log("SLACK", response.data);
			if (callback) {
				callback();
			}
		}).catch((error) => {
	});
}
