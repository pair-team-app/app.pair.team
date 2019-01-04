
//import { hasBit } from '../../utils/funcs';
import { USER_PROFILE_UPDATED } from "../../consts/action-types";

export function userProfileUpdateErrorMiddleware({ dispatch }) {
	return (function(next) {
		return (function(action) {
			if (action.type === USER_PROFILE_UPDATED) {
				console.log('userProfileUpdateErrorMiddleware()', action);
// 				if (action.payload.status) {
// 					if (hasBit(action.payload.status, 0x01) || hasBit(action.payload.status, 0x10)) {
// 						return (dispatch({ type : USER_PROFILE_ERROR, payload : action.payload.status }));
// 					}
// 				}
			}

			return (next(action));
		})
	});
}