
import cookie from 'react-cookies';

import {
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


				/*if (!payload) {
					dispatch({
						type    : CONVERTED_DEEPLINK,
						payload : {
							uploadID   : 0,
							pageID     : 0,
							artboardID : 0,
							sliceID    : 0
						}
					});

				} else {
					let deeplink = Object.assign({}, payload);
					Object.keys(payload).filter((key)=> (typeof payload[key] !== 'number')).forEach((key)=> {
						deeplink[key] = (payload[key] << 0);
					});

					dispatch({
						type    : CONVERTED_DEEPLINK,
						payload : deeplink
					});
				}*/
			}

			return (next(action));
		})
	});
}
