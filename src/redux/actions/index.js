
import axios from 'axios/index';
import qs from 'qs';
import cookie from 'react-cookies';

import { Bits } from '../../utils/lang';
import {
	ADD_FILE_UPLOAD,
	APPEND_ARTBOARD_SLICES,
	APPEND_HOME_ARTBOARDS,
	SET_REDIRECT_URI,
	USER_PROFILE_ERROR,
	UPDATE_DEEPLINK,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED,
	SET_ATOM_EXTENSION } from '../../consts/action-types';
import { LOG_ACTION_PREFIX } from '../../consts/log-ascii';


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
	return ({ payload,
		type : UPDATE_DEEPLINK
	});
}

export function fetchUserProfile() {
	logFormat('fetchUserProfile()');

	return ((dispatch)=> {
		let formData = new FormData();
		formData.append('action', 'PROFILE');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('PROFILE', response.data);

				const { id, type } = response.data.user;
				dispatch({
					type    : USER_PROFILE_LOADED,
					payload : { ...response.data.user,
						id   : id << 0,
						paid : type.includes('paid')
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
			axios.post('https://api.designengine.ai/system.php', qs.stringify({
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

export function setRedirectURI(payload) {
	return ({ payload,
		type : SET_REDIRECT_URI
	});
}

export function updateUserProfile(payload) {
	logFormat('updateUserProfile()', payload);

	return ((dispatch)=> {
		if (payload) {
			const { id, username, email, avatar, password, type } = payload;
			let formData = new FormData();
			formData.append('action', 'UPDATE_PROFILE');
			formData.append('user_id', id);
			formData.append('username', username);
			formData.append('email', email);
			formData.append('filename', avatar);
			formData.append('password', password);
			formData.append('type', type);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPDATE_PROFILE', response.data);

					const status = parseInt(response.data.status, 16);
					const { id, avatar, username, email, type } = response.data.user;

					dispatch({
						type    : (status === 0x00) ? USER_PROFILE_UPDATED : USER_PROFILE_ERROR,
						payload : {
							status   : status,
							id       : id << 0,
							avatar   : avatar,
							username : (Bits.contains(status, 0x01)) ? 'Username Already in Use' : username,
							email    : (Bits.contains(status, 0x10)) ? 'Email Already in Use' : email,
							password : '',
							type     : type,
							paid     : type.includes('paid')
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
