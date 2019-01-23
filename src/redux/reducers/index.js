
import {
	ADD_FILE_UPLOAD,
	APPEND_HOME_ARTBOARDS,
	SET_REDIRECT_URL,
	UPDATE_NAVIGATION,
	USER_PROFILE_ERROR,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED } from '../../consts/action-types';


const initialState = {
	homeArtboards : [],
	userProfile   : null,
	file          : null,
	redirectURL   : null,
	navigation    : {
		uploadID   : 0,
		pageID     : 0,
		artboardID : 0,
		sliceID    : 0
	}
};


const LOG_ACT_INVOKE_PREFIX = '[:|:]';
const LOG_ACT_TYPE_PREFIX = '\t-=\\';


function rootReducer(state=initialState, action) {
	invokeLogFormat(state, action);

	if (action.type === ADD_FILE_UPLOAD) {
		typeLogFormat(action);

		return (Object.assign({}, state, {
			file : action.payload
		}));

	} else if (action.type === APPEND_HOME_ARTBOARDS) {
		typeLogFormat(action, state.homeArtboards);

		return (Object.assign({}, state, {
			homeArtboards : (action.payload) ? state.homeArtboards.concat(action.payload).reduce((acc, inc)=>
				[...acc.filter((artboard)=> (artboard.id !== inc.id)), inc], []
			) : []
		}));

	} else if (action.type === SET_REDIRECT_URL) {
		typeLogFormat(action);

		return (Object.assign({}, state, {
			redirectURL : action.payload
		}));

	} else if (action.type === USER_PROFILE_ERROR || action.type === USER_PROFILE_LOADED || action.type === USER_PROFILE_UPDATED) {
		typeLogFormat(action);

		return (Object.assign({}, state, {
			userProfile : action.payload
		}));

	} else if (action.type === UPDATE_NAVIGATION) {
		typeLogFormat(action);

		return (Object.assign({}, state, {
			navigation : Object.assign({}, state.navigation, action.payload)
		}));
	}

	return (state);
}


const invokeLogFormat = (state, action)=> {
	const { type, payload } = action;
	console.log(LOG_ACT_INVOKE_PREFIX, 'rootReducer()', state, type, payload);
};

const typeLogFormat = (action, meta='')=> {
	const { type, payload } = action;
	console.log(LOG_ACT_TYPE_PREFIX, type, payload, meta);
};


export default rootReducer;
