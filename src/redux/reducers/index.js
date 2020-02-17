import { Objects } from 'lang-js-utils';
import { 
  COMPONENT_TYPES_LOADED, PRODUCTS_LOADED, EVENT_GROUPS_LOADED, TOGGLE_THEME, UPDATE_MOUSE_COORDS,
  SET_COMMENT, SET_COMPONENT, SET_INVITE, SET_PLAYGROUND, SET_TYPE_GROUP, SET_REDIRECT_URI, 
  TEAM_BUILDS_LOADED, BUILD_PLAYGROUNDS_LOADED, TYPE_GROUP_LOADED, TEAM_LOADED, UPDATE_MATCH_PATH,
  USER_PROFILE_ERROR, USER_PROFILE_LOADED, USER_PROFILE_UPDATED, } from '../../consts/action-types';
import { LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  componentTypes: null,
  eventGroups: [],
  playgrounds: null,
  playground: null,
  typeGroup: null,
  component: null,
  comment: null,
  products: null,
  darkThemed: false,
  matchPath: null,
  devices: null,
  redirectURI: null,
  userProfile: null,
  invite: null,
  team: null,
  history: [],
  mouse: {
    position: {
      x: 0,
      y: 0
    },
    speed: {
      x: 0,
      y: 0
    }
  }
};

const logFormat = (state, action, meta = '') => {
  const { type, payload } = action;

  if (type !== UPDATE_MOUSE_COORDS) {
    console.log(
      LOG_REDUCER_PREFIX,
      `REDUCER >> “${type}”`,
      state,
      payload,
      meta
    );
  }
};

function rootReducer(state = initialState, action) {
  const { type, payload } = action;

  let playgrounds, playground = null;
  
  logFormat(state, action);

  switch (type) {
    default:
      return (state);

    case COMPONENT_TYPES_LOADED:
      return Object.assign({}, state, {
        componentTypes: action.payload
      });

    case EVENT_GROUPS_LOADED:
      return Object.assign({}, state, {
        eventGroups: action.payload
      });

    case SET_REDIRECT_URI:
      return Object.assign({}, state, {
        redirectURI: action.payload
      });

    case SET_INVITE:
      return Object.assign({}, state, {
        invite: action.payload
      });

    case TYPE_GROUP_LOADED:
      const storePlayground = state.playgrounds.find(
        ({ id }) => id === payload.playground.id
      );

      return Object.assign({}, state, {
        //       	playgrounds : state.playgrounds.map((playground)=> ((playground.id === payload.playground.id) ? payload.playground : playground)),
        playgrounds: state.playgrounds.map(playground =>
          playground.id === payload.playground.id
            ? payload.playground
            : playground
        ),
                playground  : { ...state.playground,
        // playground: {
          // ...storePlayground,
          components: storePlayground.components
            .concat(payload.components)
            .reduce(
              (acc, inc) => [...acc.filter(({ id }) => id !== inc.id), inc],
              []
            )
        },
        
        component:
          payload.components.find(
            ({ id }) => state.component && id === state.component.id
          ) || state.component
      });

    case UPDATE_MOUSE_COORDS:
      return Object.assign({}, state, {
        mouse: Object.assign({}, state.mouse, {
          position: Object.assign({}, state.mouse.position, action.payload),
          speed: {
            x: state.mouse.position.x - action.payload.x,
            y: state.mouse.position.y - action.payload.y
          }
        })
      });

    case TEAM_BUILDS_LOADED:
      playgrounds = payload.playgrounds;
      // playgrounds = payload.playgrounds.map(playground => {
      //     console.log('=;=;=;=;=;=;=;=;= LOADED EVENT IN REDUCER', { payload : action.payload, playgrounds })

      //     return storePlayground === null
      //       ? { ...playground }
      //       : {
      //           ...playground,
      //           components: storePlayground.components
      //             .concat(payload.components)
      //             .reduce(
      //               (acc, inc) => [
      //                 ...acc.filter(({ id }) => id !== inc.id),
      //                 inc
      //               ],
      //               []
      //             )
      //         };
      //   });

      return Object.assign({}, state, { playgrounds });
      break;

    case USER_PROFILE_ERROR:
      return Object.assign({}, state, {
        userProfile: action.payload
      });

    case USER_PROFILE_LOADED:
      return Object.assign({}, state, {
        userProfile: action.payload
      });

    case USER_PROFILE_UPDATED:
      if (action.payload) {
        Objects.renameKey(action.payload, 'github_auth', 'github');
        if (action.payload.github) {
          Objects.renameKey(action.payload.github, 'access_token', 'accessToken');
        }

        const { id, type, github } = action.payload;
        return Object.assign({}, state, {
          userProfile: { ...action.payload,
            id     : id << 0,
            github : (github) ? { ...github, id : github.id << 0 } : github,
            paid   : /admin|paid/i.test(type)
          }
        });

      } else {
        return Object.assign({}, state, {
          userProfile: action.payload
        });
      }

    case UPDATE_MATCH_PATH:
      return Object.assign({}, state, {
        // matchPath: Object.assign({}, state.matchPath, action.payload.matchPath)
        matchPath: action.payload.matchPath
      });

    case TEAM_LOADED:
      return Object.assign({}, state, {
        team: action.payload
      });

    case BUILD_PLAYGROUNDS_LOADED:
      const { playgroundID } = action.payload;
      playgrounds = action.payload.playgrounds;

      const playground = playgroundID
        ? playgrounds.find(({ id }) => id === playgroundID)
        : playgrounds.find(({ deviceID }) => deviceID !== 1) || playgrounds[0];
      const component = state.component
        ? playground.components.find(({ id }) => id === state.component.id)
        : null;

      return Object.assign({}, state, { playgrounds, playground, component });
  

    case SET_PLAYGROUND:
      return Object.assign({}, state, {
        playground: action.payload
      });

    case SET_TYPE_GROUP:
      return Object.assign({}, state, {
        typeGroup: action.payload
      });

    case SET_COMPONENT:
      return Object.assign({}, state, {
        component: action.payload
      });

    case SET_COMMENT:
      return Object.assign({}, state, {
        comment: action.payload
      });

    case PRODUCTS_LOADED:
      return Object.assign({}, state, {
        products: action.payload
      });

    case TOGGLE_THEME:
      return Object.assign({}, state, {
        darkThemed:
          typeof action.payload === 'boolean'
            ? action.payload
            : !state.darkThemed
      });


    /*
    case APPEND_ARTBOARD_SLICES:
      const { artboardID, slices } = payload;

      return Object.assign({}, state, {
        uploadSlices: Object.assign(
          {},
          state.uploadSlices.findIndex(
            artboard => artboard.artboardID === artboardID
          ) > -1
            ? state.uploadSlices.filter(
                artboard => artboard.artboardID === artboardID
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
                (acc, inc) => [...acc.filter(({ id }) => id !== inc.id), inc],
                []
              )
          : []
      });
    */
  }
}

export default rootReducer;
