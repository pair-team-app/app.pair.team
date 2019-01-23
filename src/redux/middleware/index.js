
import cookie from "react-cookies";

import { CONVERTED_DEEPLINK, UPDATE_DEEPLINK, USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';


const logFormat = (action, meta='')=> {
	if (typeof action !== 'function') {
		const { type, payload } = action;
		console.log(LOG_MIDDLEWARE_PREFIX, `“${type}”`, payload, meta);
	}
};


export function onMiddleware({ dispatch }) {
	return (function(next) {
		return (function(action) {
			logFormat(action);

			const { type, payload } = action;
			if (type === USER_PROFILE_UPDATED) {
				cookie.save('user_id', (payload) ? payload.id : '0', { path : '/' });

			} else if (type === UPDATE_DEEPLINK) {
				if (!payload) {
					dispatch({
						type : CONVERTED_DEEPLINK,
						payload : {
							uploadID   : 0,
							pageID     : 0,
							artboardID : 0,
							sliceID    : 0 }
					});

				} else {
					let isNumbers = true;
					let payloadCopy = Object.assign({}, payload);
					Object.keys(payload).filter((key)=> (typeof payload[key] !== 'number')).forEach((key)=> {
						isNumbers = false;
						payloadCopy[key] = parseInt(payload[key], 10);
					});

					if (!isNumbers) {
						dispatch({
							type    : CONVERTED_DEEPLINK,
							payload : payloadCopy
						});
					}
				}
			}

			return (next(action));
		})
	});
}
