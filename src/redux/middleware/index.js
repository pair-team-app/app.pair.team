
import cookie from "react-cookies";

import { USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';


const logFormat = (action)=> {
	if (typeof action !== 'function') {
		console.log(LOG_MIDDLEWARE_PREFIX, action, `“${action.type}”`, action.payload);
	}
};


export function onMiddleware({ dispatch }) {
	return (function(next) {
		return (function(action) {
			logFormat(action);

			const { payload } = action;
			if (action.type === USER_PROFILE_UPDATED) {
				cookie.save('user_id', (payload) ? payload.id : '0', { path : '/' });
			}

			return (next(action));
		})
	});
}
