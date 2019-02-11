
import axios from 'axios/index';
import cookie from 'react-cookies';

import { hasBit } from '../../utils/funcs';
import {
	ADD_FILE_UPLOAD,
	APPEND_ARTBOARD_SLICES,
	APPEND_HOME_ARTBOARDS,
	SET_REDIRECT_URI,
	USER_PROFILE_ERROR,
	UPDATE_DEEPLINK,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_ACTION_PREFIX } from '../../consts/log-ascii';


const logFormat = (action, payload=null, meta='')=> {
	console.log(LOG_ACTION_PREFIX, `${action}()`, payload, meta);
};


export function addFileUpload(payload) {
	return ({ type : ADD_FILE_UPLOAD, payload });
}

export function appendArtboardSlices(payload) {
	return ({ type : APPEND_ARTBOARD_SLICES, payload });
}

export function appendHomeArtboards(payload) {
	return ({ type : APPEND_HOME_ARTBOARDS, payload });
}

export function updateDeeplink(payload) {
	return ({ type : UPDATE_DEEPLINK, payload });
}

export function fetchUserProfile() {
	logFormat('fetchUserProfile');

	return (function(dispatch) {
		let formData = new FormData();
		formData.append('action', 'PROFILE');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('PROFILE', response.data);
				const { id, username, email, avatar, type, joined } = response.data.user;
				dispatch({
					type    : USER_PROFILE_LOADED,
// 					payload : response.data.user
					payload : { id, username, email, avatar, joined,
						paid : (type.includes('paid'))
					}
				});
			}).catch((error) => {
		});
	});
}

export function setRedirectURI(payload) {
	return ({ type : SET_REDIRECT_URI, payload });
}

export function updateUserProfile(payload) {
	logFormat('updateUserProfile', payload);

	return (function(dispatch) {
		if (payload) {
			const { id, username, email, avatar, password } = payload;
			let formData = new FormData();
			formData.append('action', 'UPDATE_PROFILE');
			formData.append('user_id', id);
			formData.append('username', username);
			formData.append('email', email);
			formData.append('filename', avatar);
			formData.append('password', password);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPDATE_PROFILE', response.data);

					const status = parseInt(response.data.status, 16);
					const { id, avatar, username, email } = response.data.user;

					dispatch({
						type    : (status === 0x00) ? USER_PROFILE_UPDATED : USER_PROFILE_ERROR,
						payload : {
							status   : status,
							id       : id,
							avatar   : avatar,
							username : (hasBit(status, 0x01)) ? 'Username Already in Use' : username,
							email    : (hasBit(status, 0x10)) ? 'Email Already in Use' : email,
							password : ''
						}
					});
				}).catch((error) => {
			});

		} else {
			dispatch({
				type    : USER_PROFILE_UPDATED,
				payload : null
			});
		}
	});
}
