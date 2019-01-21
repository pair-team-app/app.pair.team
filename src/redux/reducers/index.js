
import {
	ADD_FILE_UPLOAD,
	APPEND_EXPLORE_ARTBOARDS,
	APPEND_UPLOAD_ARTBOARDS,
	SET_REDIRECT_URL,
	UPDATE_NAVIGATION,
	USER_PROFILE_ERROR,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED } from '../../consts/action-types';


const initialState = {
	exploreArtboards : [],
	uploadArtboards  : [],
	userProfile      : null,
	file             : null,
	redirectURL      : null,
	navigation       : {
		uploadID   : 0,
		pageID     : 0,
		artboardID : 0,
		sliceID    : 0
	}
};


const LOG_PREFIX = '[:|:]';
const LOG_ACT_PREFIX = '\t-=\\';


function rootReducer(state=initialState, action) {
	invokeLogFormat(state, action);

	if (action.type === ADD_FILE_UPLOAD) {
		actionLogFormat(action);

		return (Object.assign({}, state, {
			file : action.payload
		}));

	} else if (action.type === APPEND_EXPLORE_ARTBOARDS) {
		actionLogFormat(action, state.exploreArtboards);

		return (Object.assign({}, state, {
			exploreArtboards : state.exploreArtboards.concat(action.payload).reduce((acc, inc)=> [...acc.filter((artboard)=> (artboard.id !== inc.id)), inc], [])
		}));

	} else if (action.type === APPEND_UPLOAD_ARTBOARDS) {
		actionLogFormat(action, state.uploadArtboards);

		return (Object.assign({}, state, {
			uploadArtboards : state.uploadArtboards.concat(action.payload).reduce((acc, inc) => [...acc.filter((artboard) => (artboard.id !== inc.id)), inc], [])
		}));

	} else if (action.type === SET_REDIRECT_URL) {
		actionLogFormat(action);

		return (Object.assign({}, state, {
			redirectURL : action.payload
		}));

	} else if (action.type === USER_PROFILE_ERROR || action.type === USER_PROFILE_LOADED || action.type === USER_PROFILE_UPDATED) {
		actionLogFormat(action);

		return (Object.assign({}, state, {
			userProfile : action.payload
		}));

	} else if (action.type === UPDATE_NAVIGATION) {
		actionLogFormat(action);

		return (Object.assign({}, state, {
			navigation : Object.assign({}, state.navigation, action.payload)
		}));
	}

	return (state);
}



const actionLogFormat = (action, meta='')=> {
	const { type, payload } = action;
	console.log(LOG_ACT_PREFIX, type, payload, meta);
};

const invokeLogFormat = (state, action)=> {
	const { type, payload } = action;
	console.log(LOG_PREFIX, 'rootReducer()', state, type, payload);
};

export default rootReducer;
