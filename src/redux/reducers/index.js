
import { Objects } from 'lang-js-utils';

import {
	ADD_FILE_UPLOAD,
	APPEND_ARTBOARD_SLICES,
	APPEND_HOME_ARTBOARDS,
	SET_ARTBOARD_COMPONENT,
	SET_ARTBOARD_GROUPS,
	SET_REDIRECT_URI,
	CONVERTED_DEEPLINK,
	USER_PROFILE_ERROR,
	USER_PROFILE_LOADED,
	USER_PROFILE_UPDATED,
	SET_ATOM_EXTENSION,
	SET_INVITE,
	SET_TEAM,
} from '../../consts/action-types';
import { LOG_REDUCER_PREFIX } from '../../consts/log-ascii';


const initialState = {
	atomExtension      : false,
	file               : null,
	homeArtboards      : [],
	artboardComponents : null,
	artboardGroups     : [],
	deeplink           : {
		uploadID   : 0,
		pageID     : 0,
		artboardID : 0,
		sliceID    : 0
	},
	redirectURI        : null,
	uploadSlices       : [],
	userProfile        : null,
	invite             : null,
	team               : null
};

const logFormat = (state, action, meta='')=> {
	const { type, payload } = action;
	console.log(LOG_REDUCER_PREFIX, `REDUCER >> “${type}”`, state, payload, meta);
};


function rootReducer(state=initialState, action) {
	logFormat(state, action);

	switch (action.type) {
		default:
			return (state);


		case ADD_FILE_UPLOAD:
			return (Object.assign({}, state, {
				file : action.payload
			}));

		case APPEND_ARTBOARD_SLICES:
			const { payload } = action;
			const { artboardID, slices } = payload;

			return (Object.assign({}, state, {
				uploadSlices : Object.assign({}, (state.uploadSlices.findIndex((artboard)=>
					(artboard.artboardID === artboardID)) > -1)
					? state.uploadSlices.filter((artboard)=> (artboard.artboardID === artboardID))
					: state.uploadSlices, { artboardID, slices })
			}));

		case APPEND_HOME_ARTBOARDS:
			return (Object.assign({}, state, {
				homeArtboards : (action.payload) ? state.homeArtboards.concat(action.payload).reduce((acc, inc)=>
					[...acc.filter((artboard)=> (artboard.id !== inc.id)), inc], []
				) : []
			}));

		case SET_ARTBOARD_COMPONENT:
			const { uuid, syntax, timestamp } = action.payload;

			return (Object.assign({}, state, {
				artboardComponents : {
					...state.artboardComponents,
					[uuid] : {
						syntax    : syntax,
						timestamp : timestamp
					}
				}
			}));

		case SET_ARTBOARD_GROUPS:
			return (Object.assign({}, state, {
				artboardGroups : action.payload
			}));

		case SET_REDIRECT_URI:
			return (Object.assign({}, state, {
				redirectURI : action.payload
			}));

		case SET_INVITE:
			return (Object.assign({}, state, {
				invite : action.payload
			}));

		case USER_PROFILE_ERROR:
			return (Object.assign({}, state, {
				userProfile : action.payload
			}));

		case USER_PROFILE_LOADED:
			return (Object.assign({}, state, {
				userProfile : action.payload
			}));

		case USER_PROFILE_UPDATED:
			if (action.payload) {
				Objects.renameKey(action.payload, 'github_auth', 'github');
				if (action.payload.github) {
					Objects.renameKey(action.payload.github, 'access_token', 'accessToken');
				}

				const { id, type, github } = action.payload;
				return (Object.assign({}, state, {
					userProfile : { ...action.payload,
						id     : id << 0,
						github : (github) ? { ...github,
							id : github.id << 0
						} : github,
						paid   : type.includes('paid')
					}
				}));

			} else {
				return (Object.assign({}, state, {
					userProfile : action.payload
				}));
			}

		case CONVERTED_DEEPLINK:
			return (Object.assign({}, state, {
				deeplink : Object.assign({}, state.deeplink, action.payload)
			}));

		case SET_ATOM_EXTENSION:
			return (Object.assign({}, state, {
				atomExtension : action.payload
			}));

		case SET_TEAM:
			return (Object.assign({}, state, {
				team : action.payload
			}));
	}
}

/*

const { id, type, github } = payload;
		payload = {
			...payload,
			id     : id << 0,
			github : (github) ? {
				...github,
				id : github.id << 0
			} : github,
			paid   : type.includes('paid')
		};

		*/


export default rootReducer;
