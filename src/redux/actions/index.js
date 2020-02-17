import axios from 'axios';
import { Bits, Objects } from 'lang-js-utils';
import cookie from 'react-cookies';
import {
BUILD_PLAYGROUNDS_LOADED, COMPONENT_TYPES_LOADED, EVENT_GROUPS_LOADED, SET_COMMENT, SET_COMPONENT,
  SET_INVITE, SET_PLAYGROUND, SET_PLAYGROUNDS, SET_PRODUCTS, SET_REDIRECT_URI, SET_TEAM, SET_TYPE_GROUP, TEAM_BUILDS_LOADED, TOGGLE_THEME, TYPE_GROUP_LOADED, UPDATE_DEEPLINK, UPDATE_MOUSE_COORDS, USER_PROFILE_ERROR,
  USER_PROFILE_LOADED, USER_PROFILE_UPDATED, LOCATION_UPDATED, TEAM_LOADED
} from '../../consts/action-types';
import { jsonFormatKB } from '../../consts/formats';
import { LOG_ACTION_PREFIX } from '../../consts/log-ascii';
import { API_ENDPT_URL } from '../../consts/uris';

const logFormat = (action, state, payload = null, meta = "") => {
  console.log(LOG_ACTION_PREFIX, `ACTION >> ${action}`, { payload : payload || {}, meta, state });
};


// these are all action CREATORS that rtrn a funct
export function fetchBuildPlaygrounds(payload=null) {
  const { buildID, playgroundID } = payload;
  return (dispatch, getState) => {
    logFormat("fetchBuildPlaygrounds()", getState(), payload);

    axios
      .post(API_ENDPT_URL, {
        action: 'BUILD_PLAYGROUNDS',
        payload: {
          build_id: buildID
        }
      })
      .then(async response => {
        console.log('BUILD_PLAYGROUNDS', response.data);

        const playgrounds = response.data.playgrounds.map(playground => ({
          ...playground,
          size: jsonFormatKB(playground, true),
          components: playground.components.map(component => ({ ...component,
            id: component.id,
            title: component.title,
            size: jsonFormatKB(component, true)
          }))
        }));

        console.log("BUILD_PLAYGROUNDS [SIZE]", { playgrounds });
        dispatch({
          type: BUILD_PLAYGROUNDS_LOADED,
          payload: { playgrounds, playgroundID }
        });
      })
      .catch(error => {});
  };
}

export function fetchComponentTypes(payload=null) {
  return (dispatch, getState) => {
    logFormat("fetchComponentTypes()", getState(), payload);
    
    axios
      .post(API_ENDPT_URL, {
        action: 'COMPONENT_TYPES',
        payload: null
      })
      .then(response => {
        console.log('COMPONENT_TYPES', response.data);
        dispatch({
          type: COMPONENT_TYPES_LOADED,
          payload: response.data.component_types
        });
      })
      .catch(error => {});
  };
}

export function fetchEventGroups(payload=null) {
  return (dispatch, getState)=> {
    logFormat("fetchEventGroups()", getState(), payload);

    axios
      .post(API_ENDPT_URL, {
        action: 'EVENT_GROUPS',
        payload: null
      })
      .then(response => {
        console.log('EVENT_GROUPS', response.data);

        dispatch({
          type: EVENT_GROUPS_LOADED,
          payload: response.data.event_groups.map(eventGroup => {
            const events = eventGroup.event_types;
            delete eventGroup['event_types'];

            return { ...eventGroup, events };
          })
        });
      })
      .catch(error => {});
  };
}

export function fetchTeamBuilds(payload=null) {
  return (dispatch, getState)=> {
    const { team } = payload;

    logFormat("fetchTeamBuilds()", getState(), payload);

    axios
      .post(API_ENDPT_URL, {
        action: 'TEAM_BUILDS',
        payload: {
          team_id: team.id,
          device_id: 1
        }
      })
      .then(response => {
        console.log('TEAM_BUILDS', response.data);
        const { playgrounds } = response.data;

        dispatch({
          type: TEAM_BUILDS_LOADED,
          payload: { team, playgrounds }
        });
      })
      .catch(error => {});
  };
}

export function fetchPlaygroundComponentGroup(payload=null) {
  const { playground, typeGroup } = payload;
  return (dispatch, getState)=> {
    logFormat("fetchPlaygroundComponentGroup()", getState(), payload);

    axios
      .post(API_ENDPT_URL, {
        action: 'PLAYGROUND_TYPE_GROUP_COMPONENTS',
        payload: {
          playground_id: playground.id,
          type_group_id: typeGroup.id,
          verbose: true
        }
      })
      .then(async response => {
        //       console.log('PLAYGROUND_TYPE_GROUP_COMPONENTS', response.data);

        const { components } = response.data;
        console.log(
          "PLAYGROUND_TYPE_GROUP_COMPONENTS [SIZE]",
          Object.values(components).map(component => ({
            id: component.id,
            title: component.title,
            size: jsonFormatKB(component, true)
          }))
        );

        dispatch({
          type: TYPE_GROUP_LOADED,
          payload: { playground, components: Object.values(components) }
        });
      })
      .catch(error => {});
  };
}

export function fetchProducts(payload=null) {
  return (dispatch, getState)=> {
    logFormat("fetchProducts()", getState(), payload);

    axios
      .post(API_ENDPT_URL, {
        action: 'PRODUCTS',
        payload: null
      })
      .then(response => {
        console.log('PRODUCTS', response.data);

        dispatch({
          type: SET_PRODUCTS,
          payload: response.data.products
            .map(product => {
              return { ...product };
            })
            .sort((i, j) =>
              i.price < j.price ? -1 : i.price > j.price ? 1 : 0
            )
        });
      })
      .catch(error => {});
  };
}

export function fetchUserProfile(payload=null) {
  return (dispatch, getState) => {
    logFormat("fetchUserProfile()", getState(), payload);

    axios
      .post(API_ENDPT_URL, {
        action: 'USER_PROFILE',
        payload: { user_id: cookie.load('user_id') << 0 }
      })
      .then(response => {
        console.log('USER_PROFILE', response.data);

        Objects.renameKey(response.data.user, 'github_auth', 'github');
        if (response.data.user.github) {
          Objects.renameKey(
            response.data.user.github,
            'access_token',
            'accessToken'
          );
        }

        const { id, type, github } = response.data.user;
        dispatch({
          type: USER_PROFILE_LOADED,
          payload: {
            ...response.data.user,
            id: id << 0,
            status: 0x00,
            github: github ? { ...github, id: github.id << 0 } : github,
            paid: type.includes('paid')
          }
        });
      })
      .catch(error => {});
  };
}

export function fetchTeamLookup(payload=null) {
  const { userID } = payload;
  return (dispatch, getState)=> {
    logFormat("fetchTeamLookup()", getState(), payload);

    axios
      .post(API_ENDPT_URL, {
        action: 'TEAM_LOOKUP',
        payload: {
          user_id: userID
        }
      })
      .then(response => {
        console.log('TEAM_LOOKUP', response.data);
        const { team } = response.data;

        if (team) {
          dispatch({
            type: TEAM_LOADED,
            payload: {
              ...team,
              members: team.members.map(member => ({
                ...member,
                id: member.id << 0
              }))
            }
          });
        }
      })
      .catch(error => {});
  };
}

export function setInvite(payload) {
  logFormat("setInvite()", null, payload);
  return { payload, type: SET_INVITE };
}

export function setPlayground(payload) {
  logFormat("setPlayground()", null, payload);
  return { payload, type: SET_PLAYGROUND };
}

export function setPlaygrounds(payload) {
  logFormat("setPlaygrounds()", null, payload);
  return { payload, type: SET_PLAYGROUNDS };
}

export function setTypeGroup(payload) {
  logFormat("setTypeGroup()", null, payload);
  return { payload, type: SET_TYPE_GROUP };
}

export function setComponent(payload) {
  logFormat("setComponent()", null, payload);
  return { payload, type: SET_COMPONENT };
}

export function setComment(payload) {
  logFormat("setComment()", null, payload);
  return { payload, type: SET_COMMENT };
}

export function setRedirectURI(payload) {
  return { payload, type: SET_REDIRECT_URI };
}

export function toggleTheme(payload = null) {
  logFormat("toggleTheme()", null, payload);
  return { payload, type: TOGGLE_THEME };
}

export function updateLocation(payload) {
  return ({ payload, type : LOCATION_UPDATED });
}

export function updateDeeplink(payload) {
  return { payload, type: UPDATE_DEEPLINK };

  // 	const cnt = (payload) ? Object.keys(payload).filter((key)=> (payload && typeof payload[key] === 'number')).length : 0;
  // 	return ({ payload,
  // 		type : (!payload || Object.keys(payload).length !== cnt) ? UPDATE_DEEPLINK : CONVERTED_DEEPLINK
  // 	});
}

export function updateMouseCoords(payload) {
  // 	logFormat('updateMouseCoords()', payload);
  return { payload, type: UPDATE_MOUSE_COORDS };
}

export function updateUserProfile(payload, force = true) {
  logFormat("updateUserProfile()", payload, force);

  if (payload) {
    Objects.renameKey(payload, 'github_auth', 'github');

    if (payload.github) {
      Objects.renameKey(payload.github, 'access_token', 'accessToken');
    }

    const { id, github } = payload;
    payload = {
      ...payload,
      id: id << 0,
      github: github
        ? {
            ...github,
            id: github.id << 0
          }
        : github
    };

    if (payload.hasOwnProperty('password') && payload.password === "") {
      delete payload.password;
    }
  }

  if (!force) {
    return dispatch => {
      dispatch({ payload, type: USER_PROFILE_UPDATED });
    };
  }

  return dispatch => {
    if (payload) {
      const { id } = payload;
      axios
        .post(API_ENDPT_URL, {
          action: 'UPDATE_USER_PROFILE',
          payload: {
            ...payload,
            user_id: id
            // 					filename : avatar
          }
        })
        .then(response => {
          console.log('UPDATE_USER_PROFILE', response.data);

          const status = parseInt(response.data.status, 16);
          Objects.renameKey(response.data.user, 'github_auth', 'github');
          if (response.data.user.github) {
            Objects.renameKey(
              response.data.user.github,
              'access_token',
              'accessToken'
            );
          }

          if (status === 0x00) {

          }

          const { id, username, email, type, github } = response.data.user;
          dispatch({
            type: status === 0x00 ? USER_PROFILE_UPDATED : USER_PROFILE_ERROR,
            payload: {
              ...response.data.user,
              status: status,
              id: id << 0,
              username: Bits.contains(status, 0x01)
                ? "Username Already in Use"
                : username,
              email: Bits.contains(status, 0x10)
                ? "Email Already in Use"
                : email,
              github: github ? { ...github, id: github.id << 0 } : github,
              paid: type.includes('paid')
            }
          });
        })
        .catch(error => {});
    } else {
      cookie.save('user_id', '0', { path: '/', sameSite: false });

      dispatch({
        type: USER_PROFILE_UPDATED,
        payload: null
      });
    }
  };
}
