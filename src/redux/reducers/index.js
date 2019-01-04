
import { ADD_ARTICLE, APPEND_EXPLORE_ARTBOARDS, USER_PROFILE_ERROR, USER_PROFILE_LOADED, USER_PROFILE_UPDATED } from '../../consts/action-types';

const initialState = {
	articles         : [],
	exploreArtboards : [],
	userProfile      : null
};

function rootReducer(state=initialState, action) {
	console.log('rootReducer()', state, action);
	if (action.type === ADD_ARTICLE) {
		return (Object.assign({}, state, {
			articles : state.articles.concat(action.payload)
		}));

	} else if (action.type === APPEND_EXPLORE_ARTBOARDS) {
		return (Object.assign({}, state, {
			exploreArtboards : state.exploreArtboards.concat(action.payload)
		}));

	} else if (action.type === USER_PROFILE_LOADED || action.type === USER_PROFILE_UPDATED) {
		return (Object.assign({}, state, {
			userProfile : action.payload
		}));

	} else if (action.type === USER_PROFILE_ERROR) {
		return (Object.assign({}, state, {
			userProfile : action.payload
		}));
	}

	return (state);
}

export default rootReducer;
