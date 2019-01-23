
import {
	ADD_FILE_UPLOAD,
	APPEND_HOME_ARTBOARDS,
	SET_REDIRECT_URL,
	UPDATE_NAVIGATION,
	USER_PROFILE_ERROR,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_REDUCER_PREFIX } from '../../consts/log-ascii';


const initialState = {
	file          : null,
	homeArtboards : [],
	navigation    : {
		uploadID   : 0,
		pageID     : 0,
		artboardID : 0,
		sliceID    : 0
	},
	redirectURL   : null,
	uploadSlices  : [],
	userProfile   : null
};

const logFormat = (state, action, meta='')=> {
	const { type, payload } = action;
	console.log(LOG_REDUCER_PREFIX, state, `“${type}”`, payload, meta);
};


function rootReducer(state=initialState, action) {
	logFormat(state, action);

	if (action.type === ADD_FILE_UPLOAD) {
		return (Object.assign({}, state, {
			file : action.payload
		}));

	} else if (action.type === APPEND_HOME_ARTBOARDS) {
		return (Object.assign({}, state, {
			homeArtboards : (action.payload) ? state.homeArtboards.concat(action.payload).reduce((acc, inc)=>
				[...acc.filter((artboard)=> (artboard.id !== inc.id)), inc], []
			) : []
		}));

	} else if (action.type === SET_REDIRECT_URL) {
		return (Object.assign({}, state, {
			redirectURL : action.payload
		}));

	} else if (action.type === USER_PROFILE_ERROR || action.type === USER_PROFILE_LOADED || action.type === USER_PROFILE_UPDATED) {
		return (Object.assign({}, state, {
			userProfile : action.payload
		}));

	} else if (action.type === UPDATE_NAVIGATION) {
		return (Object.assign({}, state, {
			navigation : Object.assign({}, state.navigation, action.payload)
		}));
	}

	return (state);
}


export default rootReducer;
