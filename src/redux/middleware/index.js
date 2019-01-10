
import cookie from "react-cookies";

import { USER_PROFILE_UPDATED } from '../../consts/action-types';


export function onMiddleware({ dispatch }) {
// 	console.log('onMiddleware().dispatch', dispatch);

	return (function(next) {
// 		console.log('onMiddleware().next', next);

		return (function(action) {
			console.log('onMiddleware().action', action);

			const { payload } = action;
			if (action.type === USER_PROFILE_UPDATED) {
				cookie.save('user_id', (payload) ? payload.id : '0', { path : '/' });
				cookie.save('username', (payload) ? payload.username : '', { path : '/' });
				//
// 			} else if (action.type === APPEND_UPLOAD_ARTBOARDS) {
// 				console.log('onMiddleware()', payload.unique());
//
// 				return (
// 					dispatch({
// 						type    : action.type,
// 						payload : payload.unique()
// 					})
// 				);
			}

			return (next(action));
		})
	});
}