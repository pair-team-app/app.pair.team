
import axios from 'axios/index';
import cookie from 'react-cookies';

import { hasBit } from '../../utils/funcs';
import {
	ADD_FILE_UPLOAD,
	APPEND_EXPLORE_ARTBOARDS,
	APPEND_UPLOAD_ARTBOARDS,
	SET_REDIRECT_URL,
	USER_PROFILE_ERROR,
	UPDATE_NAVIGATION,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED } from '../../consts/action-types';


export function addFileUpload(payload) {
	return ({ type : ADD_FILE_UPLOAD, payload });
}

export function appendExploreArtboards(payload) {
	return ({ type : APPEND_EXPLORE_ARTBOARDS, payload });
}

export function appendUploadArtboards(payload) {
	return ({ type : APPEND_UPLOAD_ARTBOARDS, payload });
}

export function updateNavigation(payload) {
	return ({ type : UPDATE_NAVIGATION, payload });
}

export function fetchUserProfile() {
	console.log('fetchUserProfile()');

	return (function(dispatch) {
		let formData = new FormData();
		formData.append('action', 'PROFILE');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('fetchUserProfile()=> PROFILE', response.data);
				dispatch({
					type    : USER_PROFILE_LOADED,
					payload : response.data.user
				});
			}).catch((error) => {
		});
	});
}

export function setRedirectURL(payload) {
	return ({ type : SET_REDIRECT_URL, payload });
}

export function updateUserProfile(payload) {
	console.log('updateUserProfile()', payload);

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
					console.log('updateUserProfile()=> UPDATE_PROFILE', response.data);

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
