
import axios from 'axios/index';
import qs from 'qs';
import cookie from 'react-cookies';

import { Bits, Objects } from '../../utils/lang';
import {
	ADD_FILE_UPLOAD,
	APPEND_ARTBOARD_SLICES,
	APPEND_HOME_ARTBOARDS,
	SET_REDIRECT_URI,
	USER_PROFILE_ERROR,
	UPDATE_DEEPLINK,
// 	USER_PROFILE_CACHED,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED,
	SET_ATOM_EXTENSION,
	CONVERTED_DEEPLINK,
	SET_INVITE
} from '../../consts/action-types';
import { LOG_ACTION_PREFIX } from '../../consts/log-ascii';
import { API_ENDPT_URL } from '../../consts/uris';


const logFormat = (action, payload=null, meta='')=> {
	console.log(LOG_ACTION_PREFIX, `ACTION >> ${action}`, payload, meta);
};


export function addFileUpload(payload) {
	return ({ payload,
		type : ADD_FILE_UPLOAD
	});
}

export function appendArtboardSlices(payload) {
	return ({ payload,
		type : APPEND_ARTBOARD_SLICES
	});
}

export function appendHomeArtboards(payload) {
	return ({ payload,
		type : APPEND_HOME_ARTBOARDS
	});
}

export function updateDeeplink(payload) {
	const cnt = (payload) ? Object.keys(payload).filter((key, i)=> (payload && typeof payload[key] === 'number')).length : 0;
	return ({ payload,
		type : (!payload || Object.keys(payload).length !== cnt) ? UPDATE_DEEPLINK : CONVERTED_DEEPLINK
	});

// 	return ({ payload,
// 		type : UPDATE_DEEPLINK
// 	});
}

export function fetchUserProfile() {
	logFormat('fetchUserProfile()');

	return ((dispatch)=> {
		let formData = new FormData();
		formData.append('action', 'PROFILE');
		formData.append('user_id', cookie.load('user_id'));
		axios.post(API_ENDPT_URL, formData)
			.then((response)=> {
				console.log('PROFILE', response.data);

				Objects.renameKey(response.data.user, 'github_auth', 'github');
				if (response.data.user.github) {
					Objects.renameKey(response.data.user.github, 'access_token', 'accessToken');
				}

				const { id, type, github } = response.data.user;
				dispatch({
					type    : USER_PROFILE_LOADED,
					payload : { ...response.data.user,
						id     : id << 0,
						github : (github) ? { ...github,
							id : github.id << 0
						} : github,
						paid   : type.includes('paid')
					}
				});
			}).catch((error) => {
		});
	});
}

export function fetchUserHistory(payload) {
	logFormat('fetchUserHistory()', payload);

	return ((dispatch)=> {
		if (payload.profile) {
			const { profile, loadOffset, loadAmt } = payload;
			axios.post(API_ENDPT_URL, qs.stringify({
				action  : 'USER_HISTORY',
				user_id : profile.id,
				offset  : (loadOffset || 0),
				length  : (loadAmt || -1)
			})).then((response)=> {
				console.log('USER_HISTORY', response.data);

				const artboards = response.data.artboards.filter((artboard)=> (artboard)).map((artboard)=> ({
					id        : artboard.id << 0,
					pageID    : artboard.page_id << 0,
					uploadID  : artboard.upload_id << 0,
					title     : artboard.page_title,
					pageTitle : artboard.title,
					filename  : artboard.filename,
					creator   : artboard.creator,
					meta      : JSON.parse(artboard.meta),
					added     : artboard.added
				}));

				if (artboards.length > 0) {
					dispatch({
						type    : APPEND_HOME_ARTBOARDS,
						payload : artboards
					});
				}
			}).catch((error)=> {
			});
		}
	});
}

export function setAtomExtension(payload) {
	logFormat('setAtomExtension()', payload);
	return ({ payload,
		type : SET_ATOM_EXTENSION
	});
}


export function setInvite(payload) {
	logFormat('setInvite()', payload);
	return ({ payload,
		type : SET_INVITE
	});
}

export function setRedirectURI(payload) {
	return ({ payload,
		type : SET_REDIRECT_URI
	});
}

export function updateUserProfile(payload, force=true) {
	logFormat('updateUserProfile()', payload, force);

	if (payload) {
		Objects.renameKey(payload, 'github_auth', 'github');
		if (payload.github) {
			Objects.renameKey(payload.github, 'access_token', 'accessToken');
		}

		const { id, type, github } = payload;
		payload = {
			...payload,
			id     : id << 0,
			github : (github) ? {
				...github,
				id : github.id << 0
			} : github,
			paid   : type.includes('paid')
		};
	}


	if (!force) {
		return((dispatch)=> {
			dispatch({ payload,
				type : USER_PROFILE_UPDATED
			});
		});
	}

	return ((dispatch)=> {
		if (payload) {
			const { id, avatar, sources, integrations } = payload;

// 			if (typeof cookie.load('user_id') === 'undefined' || ((cookie.load('user_id') << 0) !== id)) {
// 				cookie.save('user_id', id << 0, { path : '/' });
// 			}

			axios.post(API_ENDPT_URL, qs.stringify(Object.assign({}, payload, {
				action       : 'UPDATE_PROFILE',
				user_id      : id,
				filename     : avatar,
				sources      : sources.join(','),
				integrations : integrations.join(',')
			}))).then((response)=> {
				console.log('UPDATE_PROFILE', response.data);

				const status = parseInt(response.data.status, 16);

				Objects.renameKey(response.data.user, 'github_auth', 'github');
				if (response.data.user.github) {
					Objects.renameKey(response.data.user.github, 'access_token', 'accessToken');
				}

				const { id, username, email, type, github } = response.data.user;
				dispatch({
					type    : (status === 0x00) ? USER_PROFILE_UPDATED : USER_PROFILE_ERROR,
					payload : { ...response.data.user,
						status   : status,
						id       : id << 0,
						username : (Bits.contains(status, 0x01)) ? 'Username Already in Use' : username,
						email    : (Bits.contains(status, 0x10)) ? 'Email Already in Use' : email,
						github : (github) ? { ...github,
							id : github.id << 0
						} : github,
						paid     : type.includes('paid')
					}
				});
			}).catch((error) => {
			});

		} else {
			cookie.save('user_id', '0', { path : '/' });

			dispatch({
				type    : USER_PROFILE_UPDATED,
				payload : null
			});
		}
	});
}
