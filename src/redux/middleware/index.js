
import cookie from 'react-cookies';

import {
	APPEND_HOME_ARTBOARDS,
	SET_TEAM,
	CONVERTED_DEEPLINK,
	UPDATE_DEEPLINK,

	USER_PROFILE_CACHED,
	USER_PROFILE_UPDATED
} from '../../consts/action-types';

import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';


const logFormat = (action, meta='')=> {
	if (typeof action !== 'function') {
		const { type, payload } = action;
		console.log(LOG_MIDDLEWARE_PREFIX, `MW >> “${type}”`, payload, meta);
	}
};


export function onMiddleware({ dispatch }) {
	return (function(next) {
		return (function(action) {
			logFormat(action);

			const { type, payload } = action;
			if (type === USER_PROFILE_CACHED) {
			} else if (type === USER_PROFILE_UPDATED) {
				cookie.save('user_id', (payload) ? payload.id : '0', { path : '/' });

			} else if (type === UPDATE_DEEPLINK) {
				const deeplink = Object.assign({}, payload, {
					uploadID   : (payload && payload.uploadID) ? (payload.uploadID << 0) : 0,
					pageID     : (payload && payload.pageID) ? (payload.pageID << 0) : 0,
					artboardID : (payload && payload.artboardID) ? (payload.artboardID << 0) : 0,
					sliceID    : (payload && payload.sliceID) ? (payload.sliceID << 0) : 0
				});

				dispatch({
					type    : CONVERTED_DEEPLINK,
					payload : deeplink
				});

			} else if (type === SET_TEAM) {
				const artboards = payload.uploads.map((upload)=> (upload.pages.flatMap((page)=> (page.artboards.filter((artboard)=> (artboard.type === 'page_child'))))).pop()).filter((artboard)=> (artboard)).map((artboard) => ({
					id        : artboard.id << 0,
					pageID    : artboard.page_id << 0,
					uploadID  : artboard.upload_id << 0,
					title     : artboard.upload_title,
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
			}

			return (next(action));
		})
	});
}
