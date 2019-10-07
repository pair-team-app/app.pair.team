
import axios from 'axios';
import { Strings, URIs } from 'lang-js-utils';
import Octokit from '@octokit/rest';
import cookie from 'react-cookies';
import { matchPath } from 'react-router-dom';

import { API_ENDPT_URL } from '../consts/uris';


export function getRouteParams(pathname) {
// 	console.log('_-_-_-_-_', 'getRouteParams()', pathname, '_-_-_-_-_', URIs.firstComponent(pathname));

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
		path : `/${URIs.firstComponent(pathname)}/:uploadID/:titleSlug`
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


export function buildInspectorPath(upload, prefix='/specs', suffix='') {
	return (`${Strings.trimSlashes(prefix)}/${upload.id}/${Strings.slugifyURI(upload.title)}${Strings.trimSlashes(suffix)}`);
}

export function buildInspectorURL(upload, prefix='/specs', suffix='') {
	return (`${window.location.origin}${buildInspectorPath(upload, prefix, suffix)}`);
}

export function createGist(token, filename, contents, description, visible, callback=null) {
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

		if (callback) {
			callback(result.data);
		}
	});
}

export function editGist(token, gistID, filename, contents, description, visible, callback=null) {
	const payload = { gistID, description,
		gist_id : gistID,
		public  : visible,
		files   : {
			[filename] : {
				content : contents
			}
		}
	};

	new Octokit({ auth : token }).gists.update(payload).then((result)=> {
		console.log('EDIT_GIST ->', result);

		if (callback) {
			callback(result.data);
		}
	});
}

export function idsFromPath() {
	const { pathname } = window.location;
	const inspectorPath = /\/(?:specs|styles|parts|edit)\/(\d+)\/.+$/i;

	const navIDs = {
		uploadID   : ((inspectorPath.test(pathname)) ? pathname.match(inspectorPath)[1] : 0) << 0,
		pageID     : 0 << 0,
		artboardID : 0 << 0,
		sliceID    : 0 << 0
	};

	return (navIDs);
}

/*
export function isHomePage(root=true) {
	const { pathname } = window.location;
	return ((root) ? (pathname === '' || pathname === HOME) : (pathname === '' || pathname === HOME || pathname === INSPECT ||pathname === EDIT));
}

export function isInspectorPage() {
	const { pathname } = window.location;
	return ((pathname.includes(`${SPECS}/`) || pathname.includes(`${STYLES}/`) || pathname.includes(`${PARTS}`) || pathname.includes(`${EDIT}`)) && /^.+\/\d+\/.+$/.test(pathname));
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
*/

export function isUserLoggedIn(confirmed=true) {
// 	return ((confirmed) ? cookie.load('user_id') !== '0' : typeof cookie.load('user_id') !== 'undefined');
	return ((confirmed) ? ((cookie.load('user_id') << 0) !== 0) : (typeof cookie.load('user_id') !== 'undefined') << 0 !== 0);
}

export function sendToSlack(message, callback=null) {

	axios.post(API_ENDPT_URL, {
		action  : 'SLACK_MSG',
		payload : { message }
	}).then((response) => {
		console.log("SLACK_MSG", response.data);
		if (callback) {
			callback();
		}
	}).catch((error)=> {
	});
}
