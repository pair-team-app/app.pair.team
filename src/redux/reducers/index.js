
import { 
  COMPONENT_TYPES_LOADED, DEVICES_LOADED, PRODUCTS_LOADED, EVENT_GROUPS_LOADED, TOGGLE_THEME, UPDATE_MOUSE_COORDS,
  SET_COMMENT, SET_COMPONENT, SET_INVITE, SET_PLAYGROUND, SET_TYPE_GROUP, SET_REDIRECT_URI, SET_TEAM,
  TEAM_BUILDS_LOADED, BUILD_PLAYGROUNDS_LOADED, TYPE_GROUP_LOADED, TEAM_LOADED, TEAM_LOGO_LOADED, PLAYGROUND_LOADED, UPDATE_MATCH_PATH, TEAM_COMMENTS_LOADED, 
  USER_PROFILE_ERROR, USER_PROFILE_LOADED, USER_PROFILE_UPDATED, COMMENT_ADDED, COMMENT_UPDATED,
  TOGGLE_AX, TOGGLE_COMMENTS, UPDATE_RESIZE_BOUNDS
} from '../../consts/action-types';
import { LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  componentTypes : [],
  devices        : [],
  eventGroups    : [],
  playgrounds    : [],
  playground     : null,
  typeGroup      : null,
  resizeBounds   : null,
  components     : [],
  component      : null,
  comment        : null,
  comments       : [],
  ax             : false,
  products       : [],
  darkThemed     : false,
  matchPath      : null,
  device         : null,
  redirectURI    : null,
  userProfile    : null,
  invite         : null,
  team           : null,
  history        : [],
  mouse          : {
    position : {
      x : 0,
      y : 0
    },
    speed    : {
      x : 0,
      y : 0
    }
  }
};

const logFormat = (state, action, meta = '')=> {
  const { type, payload } = action;

  if (type !== UPDATE_MOUSE_COORDS) {
    console.log(LOG_REDUCER_PREFIX, `REDUCER >> “${type}”`, { state, payload, meta });
  }
};

function rootReducer(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === COMPONENT_TYPES_LOADED) {
    const { componentTypes } = action.payload;
    return (Object.assign({}, state, { componentTypes }));

  } else if (type === DEVICES_LOADED) {
    const { devices } = action.payload;
    return (Object.assign({}, state, { devices }));

  } else if (type === EVENT_GROUPS_LOADED) {
    return (Object.assign({}, state, { eventGroups: action.payload }));

  } else if (type === SET_REDIRECT_URI) {
    return (Object.assign({}, state, { redirectURI: action.payload }));

  } else if (type === SET_INVITE) {
    return (Object.assign({}, state, { invite: action.payload }));

  } else if (type === TYPE_GROUP_LOADED) {
    const { playgrounds, playground } = payload;
    return (Object.assign({}, state, { playgrounds, playground }));

  } else if (type === UPDATE_MOUSE_COORDS) {
    const { mouse } = payload;
    return (Object.assign({}, state, { mouse }));
      
  } else if (type === TEAM_BUILDS_LOADED) {
    const { playgrounds, comments, playground, typeGroup, components, component, comment } = payload;
    return (Object.assign({}, state, { playgrounds, comments, playground, typeGroup, components, component, comment }));

  } else if (type === TEAM_COMMENTS_LOADED) {
    const { team, comments } = payload;
    return (Object.assign({}, state, { comments }));
  
  // } else if (type === PLAYGROUND_LOADED) {
  //   const playgrounds = state.playgrounds.map((playground)=> ((playground.id === payload.playground.id) ? payload.playground : playground));
  //   const { playground } = payload;

  //   return (Object.assign({}, state, { playgrounds, playground }));

  } else if (type === USER_PROFILE_ERROR || type === USER_PROFILE_LOADED) {
    const { userProfile } = payload;
    // console.log('!!!!!!!!!!!!!!', userProfile);
    return (Object.assign({}, state, { userProfile }));

  } else if (type === USER_PROFILE_UPDATED) {
    const userProfile = payload;
    return (Object.assign({}, state, { userProfile }));

  } else if (type === UPDATE_MATCH_PATH) {
    const { matchPath } = payload;
    return Object.assign({}, state, { matchPath });

  } else if (type === UPDATE_RESIZE_BOUNDS) {
    const { resizeBounds } = payload;
    return Object.assign({}, state, { resizeBounds });

  } else if (type === TEAM_LOADED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === TEAM_LOGO_LOADED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === BUILD_PLAYGROUNDS_LOADED) {
    const { playgrounds, comments, playground, typeGroup, components, component, comment } = payload;
    return (Object.assign({}, state, { playgrounds, comments, playground, typeGroup, components, component, comment }));
  
  } else if (type === COMMENT_ADDED || type === COMMENT_UPDATED) {
    const { comments } = payload;
    return (Object.assign({}, state, { comments }));

  } else if (type === SET_TEAM) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));
  
  } else if (type === SET_PLAYGROUND) {
    const { playground } = payload;
    return (Object.assign({}, state, { playground }));

  } else if (type === SET_TYPE_GROUP) {
    const { typeGroup } = payload;
    return (Object.assign({}, state, { typeGroup }));

  } else if (type === SET_COMPONENT) {
    const { component } = payload;
    return (Object.assign({}, state, { component }));

  } else if (type === SET_COMMENT) {
    const { comment } = payload;
    return (Object.assign({}, state, { comment }));

  } else if (type === PRODUCTS_LOADED) {
    return (Object.assign({}, state, { products : action.payload }));

  } else if (type === TOGGLE_THEME) {
    return (Object.assign({}, state, { darkThemed : (typeof action.payload === 'boolean') ? action.payload : !state.darkThemed }));

  } else if (type === TOGGLE_AX) {
    const { ax } = payload;
    return (Object.assign({}, state, { ax }));

  } else {
    return (state);
  }

  /*
  switch (type) {          
    case APPEND_ARTBOARD_SLICES:
      const { artboardID, slices } = payload;

      return Object.assign({}, state, {
        uploadSlices: Object.assign(
          {},
          state.uploadSlices.findIndex(
            (artboard)=> artboard.artboardID === artboardID
          ) > -1
            ? state.uploadSlices.filter(
                (artboard)=> artboard.artboardID === artboardID
              )
            : state.uploadSlices,
          { artboardID, slices }
        )
      });

    case APPEND_HOME_ARTBOARDS:
      return Object.assign({}, state, {
        homeArtboards: action.payload
          ? state.homeArtboards
              .concat(action.payload)
              .reduce(
                (acc, inc)=> [...acc.filter(({ id })=> id !== inc.id), inc],
                []
              )
          : []
      });
  }*/
}

export default rootReducer;
