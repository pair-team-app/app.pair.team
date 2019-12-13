
import axios from 'axios/index';
import { Bits, Objects } from 'lang-js-utils';
import cookie from 'react-cookies';

import {
	COMPONENT_TYPES_LOADED,
	EVENT_GROUPS_LOADED,
	SET_REDIRECT_URI,
	USER_PROFILE_ERROR,
	UPDATE_DEEPLINK,
	UPDATE_MOUSE_COORDS,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED,
	CONVERTED_DEEPLINK
} from '../../consts/action-types';
import { LOG_ACTION_PREFIX } from '../../consts/log-ascii';
import { API_ENDPT_URL } from '../../consts/uris';


const logFormat = (action, payload=null, meta='')=> {
	console.log(LOG_ACTION_PREFIX, `ACTION >> ${action}`, (payload || ''), meta);
};


export function fetchComponentTypes() {
	logFormat('fetchComponentTypes()');

	return ((dispatch)=> {
		axios.post(API_ENDPT_URL, {
			action  : 'COMPONENT_TYPES',
			payload : null
		}).then((response) => {
			console.log('COMPONENT_TYPES', response.data);
			dispatch({
				type    : COMPONENT_TYPES_LOADED,
				payload : response.data.component_types
			});

		}).catch((error)=> {
		});
	});
}

export function fetchEventGroups() {
	logFormat('fetchEventGroups()');

	return ((dispatch)=> {
		axios.post(API_ENDPT_URL, {
			action  : 'EVENT_GROUPS',
			payload : null
		}).then((response) => {
			console.log('EVENT_GROUPS', response.data);

			dispatch({
				type    : EVENT_GROUPS_LOADED,
				payload : response.data.event_groups.map((eventGroup)=> {
					const events = eventGroup.event_types;
					delete (eventGroup['event_types']);

					return ({ ...eventGroup, events });
				})
			});

		}).catch((error)=> {
		});
	});
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

export function setRedirectURI(payload) {
	return ({ payload,
		type : SET_REDIRECT_URI
	});
}

export function updateDeeplink(payload) {
	const cnt = (payload) ? Object.keys(payload).filter((key)=> (payload && typeof payload[key] === 'number')).length : 0;
	return ({ payload,
		type : (!payload || Object.keys(payload).length !== cnt) ? UPDATE_DEEPLINK : CONVERTED_DEEPLINK
	});
}

export function updateMouseCoords(payload) {
// 	logFormat('updateMouseCoords()', payload);
	return ({ payload,
		type : UPDATE_MOUSE_COORDS
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
