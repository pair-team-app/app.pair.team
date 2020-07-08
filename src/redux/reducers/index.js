
import { BUILD_PLAYGROUNDS_LOADED, INVITE_LOADED, COMMENT_ADDED, COMMENT_UPDATED, COMPONENT_TYPES_LOADED, DEVICES_LOADED, PRODUCTS_LOADED, SET_COMMENT, SET_COMPONENT, SET_INVITE, SET_PLAYGROUND, SET_REDIRECT_URI, SET_TEAM, SET_TYPE_GROUP, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_UPDATED, TOGGLE_AX, TOGGLE_THEME, UPDATE_MATCH_PATH, UPDATE_MOUSE_COORDS, UPDATE_RESIZE_BOUNDS, USER_PROFILE_ERROR, USER_PROFILE_LOADED, USER_PROFILE_UPDATED, TOGGLE_CREATE_TEAM, STRIPE_SESSION_CREATED, STRIPE_SESSION_PAID } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  componentTypes : [],
  devices        : [],
  builds         : null,
  purchase       : null,
  playgrounds    : null,
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
  teams          : null,
  team           : null,
  createTeam     : false,
  stripeSession  : null,
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
    console.log(LOG_REDUCER_PREFIX, `REDUCER >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
  }
};

function rootReducer(state = initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === COMPONENT_TYPES_LOADED) {
    const { componentTypes } = action.payload;
    return (Object.assign({}, state, { componentTypes : componentTypes }));

  } else if (type === DEVICES_LOADED) {
    const { devices } = action.payload;
    return (Object.assign({}, state, { devices }));

  } else if (type === INVITE_LOADED) {
    const { invite, team } = action.payload;
    return (Object.assign({}, state, { invite, team }));

  } else if (type === SET_REDIRECT_URI) {
    return (Object.assign({}, state, { redirectURI : action.payload }));

  } else if (type === SET_INVITE) {
    return (Object.assign({}, state, { invite : action.payload }));

  } else if (type === UPDATE_MOUSE_COORDS) {
    const { mouse } = payload;
    return (Object.assign({}, state, { mouse }));

  } else if (type === TEAM_BUILDS_LOADED) {
    // const { playgrounds, comments, playground, typeGroup, components, component, comment } = payload;
    // return (Object.assign({}, state, { playgrounds, comments, playground, typeGroup, components, component, comment }));

    const { playgrounds } = payload;
    return (Object.assign({}, state, { playgrounds }));

  } else if (type === TEAM_COMMENTS_LOADED) {
    const { team, comments } = payload;
    return (Object.assign({}, state, { team, comments }));

  } else if (type === STRIPE_SESSION_CREATED) {
    const { session : stripeSession } = payload;
    return (Object.assign({}, state, { stripeSession }));

  } else if (type === STRIPE_SESSION_PAID) {
    const { purchase, team } = payload;
    return (Object.assign({}, state, { purchase, stripeSession : null, team }));

  } else if (type === TEAM_RULES_UPDATED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === USER_PROFILE_ERROR || type === USER_PROFILE_LOADED) {
    const { userProfile } = payload;
    // console.log('!!!!!!!!!!!!!!', userProfile);
    return (Object.assign({}, state, { userProfile }));

  } else if (type === USER_PROFILE_UPDATED) {
    const userProfile = payload;
    return (Object.assign({}, state, { userProfile }));

  } else if (type === UPDATE_MATCH_PATH) {
    const { matchPath, playground, typeGroup, component, comment } = payload;
    return (Object.assign({}, state, { matchPath, playground, typeGroup, component, comment }));
    // return (state);

  } else if (type === UPDATE_RESIZE_BOUNDS) {
    const { resizeBounds } = payload;
    return (Object.assign({}, state, { resizeBounds }));

  } else if (type === TEAMS_LOADED) {
    const { team, teams } = payload;
    // const { team } = payload;
    return (Object.assign({}, state, { team, teams }));
    // return ( { ...state, teams, team });
    // return (Object.assign({}, state, { team }));

  } else if (type === TEAM_UPDATED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === TEAM_LOGO_LOADED) {
    const { team } = payload;
    return (Object.assign({}, state, { team }));

  } else if (type === BUILD_PLAYGROUNDS_LOADED) {
    const { playgrounds, comments, playground, typeGroup, components, component, comment } = payload;
    return (Object.assign({}, state, { playgrounds, comments, playground, typeGroup, components, component, comment }));

  } else if (type === COMMENT_ADDED || type === COMMENT_UPDATED) {
    const { comments, component, comment } = payload;
    return (Object.assign({}, state, { comments, component, comment }));

  } else if (type === SET_TEAM) {
    const { teams, team } = payload;
    return (Object.assign({}, state, { teams, team }));
    // return ({ ...state, teams, team });
    // state.teams = teams;
    // return (state);


  } else if (type === SET_PLAYGROUND) {
    const { playgrounds, playground } = payload;
    return (Object.assign({}, state, { playgrounds, playground }));

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
    const { products } = payload;
    return (Object.assign({}, state, { products }));

  } else if (type === TOGGLE_CREATE_TEAM) {
    return (Object.assign({}, state, { createTeam : (typeof action.payload === 'boolean') ? action.payload : !state.createTeam }));

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
