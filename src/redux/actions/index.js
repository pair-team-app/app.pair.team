
import axios from 'axios/index';
import { Bits, Objects, URIs } from 'lang-js-utils';
import cookie from 'react-cookies';

import {
	ADD_FILE_UPLOAD,
	APPEND_ARTBOARD_SLICES,
	APPEND_HOME_ARTBOARDS,
	SET_ARTBOARD_GROUPS,
	SET_ARTBOARD_COMPONENT,
	SET_REDIRECT_URI,
	USER_PROFILE_ERROR,
	UPDATE_DEEPLINK,
// 	USER_PROFILE_CACHED,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED,
	SET_ATOM_EXTENSION,
	CONVERTED_DEEPLINK,
	SET_INVITE,
	SET_TEAM,
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
		axios.post(API_ENDPT_URL, {
			action  : 'USER_PROFILE',
			payload : { user_id : cookie.load('user_id') << 0 }
		}).then((response) => {
			console.log('USER_PROFILE', response.data);

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
		}).catch((error)=> {
		});
	});
}

export function fetchUserHistory(payload) {
	logFormat('fetchUserHistory()', payload);

	return ((dispatch)=> {
		if (payload.profile) {
			const { profile, loadOffset, loadAmt } = payload;

			axios.post(API_ENDPT_URL, {
				action  : 'PLAYGROUND_HISTORY',
				payload : {
					user_id : profile.id,
					offset  : (loadOffset || 0),
					length  : (loadAmt || -1)
				}
			}).then((response) => {
				console.log('PLAYGROUND_HISTORY', response.data);

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

export function fetchTeamLookup(payload) {
	logFormat('fetchTeamLookup()', payload);

	return ((dispatch)=> {
		const { subdomain } = (payload) ? payload : { subdomain : URIs.subdomain() };

		axios.post(API_ENDPT_URL, {
			action  : 'TEAM_LOOKUP',
			payload : { subdomain }
		}).then((response) => {
			console.log('TEAM_LOOKUP', response.data);

			const { team } = response.data;
			if (team) {
				dispatch({
					type    : SET_TEAM,
					payload : { ...team,
						members : team.members.map((member)=> ({
							id       : member.id << 0,
							type     : member.type,
							userID   : member.user_id << 0,
							username : member.username,
							avatar   : member.avatar
						}))
					}
				});
			}
		}).catch((error)=> {
		});
	});
}

export function setArtboardComponent(payload) {
	logFormat('setArtboardComponent()', payload);
	return ({ payload,
		type : SET_ARTBOARD_COMPONENT
	});
}
export function setArtboardGroups(payload) {
	logFormat('setArtboardGroups()', payload);
	return ({ payload,
		type : SET_ARTBOARD_GROUPS
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
			const { id, avatar } = payload;

// 			if (typeof cookie.load('user_id') === 'undefined' || ((cookie.load('user_id') << 0) !== id)) {
// 				cookie.save('user_id', id << 0, { path : '/' });
// 			}

			axios.post(API_ENDPT_URL, {
				action  : 'UPDATE_USER_PROFILE',
				payload : { ...payload,
					user_id  : id,
					filename : avatar
				}
			}).then((response) => {
				console.log('UPDATE_USER_PROFILE', response.data);

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
			}).catch((error)=> {
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
