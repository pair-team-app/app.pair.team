
import axios from 'axios';
import { Strings } from 'lang-js-utils';
import Octokit from '@octokit/rest';
import cookie from 'react-cookies';
import { matchPath } from 'react-router-dom';

import { API_ENDPT_URL, Pages } from '../consts/uris';


export function getRoutePaths(pathname) {
// 	console.log('_-_-_-_-_', 'getRoutePaths()', pathname);

	const homePage = matchPath(pathname, { path : Pages.HOME });
	const featuresPage = matchPath(pathname, { path : Pages.FEATURES });
	const pricingPage = matchPath(pathname, { path : Pages.PRICING });
	const privacyPage = matchPath(pathname, { path : Pages.PRIVACY });
	const termsPage = matchPath(pathname, { path : Pages.TERMS });
	const playgroundPage = matchPath(pathname, { path : `${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:playgroundID([0-9]+)?/:componentsSlug([A-Za-z-]+)?/:componentID([0-9]+)?/(comments)?/:commentID([0-9]+)?` });

// 	console.log(':::::::::::::', 'getRoutePaths', pathname, { homePage, featuresPage, pricingPage, privacyPage, termsPage, playgroundPage });

	if (homePage && homePage.isExact) {
		return (homePage);
	}

	if (featuresPage && featuresPage.isExact) {
		return (featuresPage);
	}

	if (pricingPage && pricingPage.isExact) {
		return (pricingPage);
	}

	if (privacyPage && privacyPage.isExact) {
		return (privacyPage);
	}

	if (termsPage && termsPage.isExact) {
		return (termsPage);
	}

	if (playgroundPage && playgroundPage.isExact) {
		return (playgroundPage);
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

export function isUserLoggedIn(confirmed=true) {
// 	return ((confirmed) ? cookie.load('user_id') !== '0' : typeof cookie.load('user_id') !== 'undefined');
	return ((confirmed) ? ((cookie.load('user_id') << 0) !== 0) : (typeof cookie.load('user_id') !== 'undefined') << 0 !== 0);
}

export function sendToSlack(channel, message, callback=null) {
	axios.post(API_ENDPT_URL, {
		action  : 'SLACK_MSG',
		payload : { channel, message }
	}).then((response) => {
		console.log("SLACK_MSG", response.data);
		if (callback) {
			callback();
		}
	}).catch((error)=> {
	});
}
