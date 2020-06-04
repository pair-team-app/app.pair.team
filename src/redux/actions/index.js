import axios from 'axios';
import { Bits, Objects } from 'lang-js-utils';
import cookie from 'react-cookies';
import { VOTE_ACTION_DOWN, VOTE_ACTION_UP } from '../../components/pages/PlaygroundPage/VoteComment';
import { BUILD_PLAYGROUNDS_LOADED, COMMENT_ADDED, COMMENT_UPDATED, COMPONENT_TYPES_LOADED, DEVICES_LOADED, PRODUCTS_LOADED, SET_COMMENT, SET_COMPONENT, SET_INVITE, SET_PLAYGROUND, SET_REDIRECT_URI, SET_TEAM, SET_TYPE_GROUP, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, TEAM_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_UPDATED, TOGGLE_THEME, UPDATE_MATCH_PATH, UPDATE_MOUSE_COORDS, UPDATE_RESIZE_BOUNDS, USER_PROFILE_ERROR, USER_PROFILE_LOADED, USER_PROFILE_UPDATED } from '../../consts/action-types';
import { API_RESPONSE_PREFIX, LOG_ACTION_POSTFIX, LOG_ACTION_PREFIX } from '../../consts/log-ascii';
import { API_ENDPT_URL } from '../../consts/uris';

const logFormat = (action, state, payload=null, meta='')=> {
  console.log(LOG_ACTION_PREFIX, `ACTION >> ${action}`, { payload : payload || {}, meta, state }, LOG_ACTION_POSTFIX);
};


// these are all action CREATORS that rtrn a funct
export function fetchBuildPlaygrounds(payload=null) {
  const { buildID } = payload;
  return (dispatch, getState)=> {
    logFormat('fetchBuildPlaygrounds()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'BUILD_PLAYGROUNDS',
      payload : {
        build_id : buildID
      }
    }).then(async (response)=> {
      console.log(API_RESPONSE_PREFIX, 'BUILD_PLAYGROUNDS', response.data);
      const { playgrounds } = response.data;

      dispatch({
        type    : BUILD_PLAYGROUNDS_LOADED,
        payload : { playgrounds }
      });
    }).catch((error)=> {});
  };
}

export function fetchComponentTypes(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchComponentTypes()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    
    axios.post(API_ENDPT_URL, {
      action: 'COMPONENT_TYPES',
      payload: null
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'COMPONENT_TYPES', response.data);
      dispatch({
        type    : COMPONENT_TYPES_LOADED,
        payload : { componentTypes : response.data.component_types }
      });
    }).catch((error)=> {});
  };
}

export function fetchDevices(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchDevices()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    
    axios.post(API_ENDPT_URL, {
      action  : 'DEVICES',
      payload : null
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'DEVICES', response.data);
      const {devices } = response.data;

      dispatch({
        type    : DEVICES_LOADED,
        payload : { devices }
      });
    }).catch((error)=> {});
  };
}

// export function fetchPlayground(payload=null) {
//   return (dispatch, getState)=> {
//     logFormat('fetchPlayground()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    
//     axios.post(API_ENDPT_URL, {
//       action  : 'PLAYGROUND',
//       payload : {
//         playground_id : payload.playgroundID,
//         verbose       : true
//       }
//     }).then((response)=> {
//       console.log('PLAYGROUND', response.data);
//       const { playground } = response.data;
//       dispatch({
//         type    : PLAYGROUND_LOADED,
//         payload : { playground }
//       });
//     }).catch((error)=> {});
//   };
// }

export function fetchTeamBuilds(payload=null) {
  return (dispatch, getState)=> {
    const { team, buildID, deviceSlug } = payload;

    logFormat('fetchTeamBuilds()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, { payload });
    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_BUILDS',
      payload : {
        team_id  : team.id,
        build_id : buildID,
        device   : deviceSlug
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'TEAM_BUILDS', response.data);
      const { playgrounds } = response.data;

      // console.log('⟨⎝⎛:⎞⎠⟩', 'TEAM_BUILDS', { builds : [ ...playgrounds].map(({ build_id : buildID, id :  playgroundID, device_id : deviceID, team_id : teamID })=> ({ buildID, playgroundID, deviceID, teamID }))});

      dispatch({
        type    : TEAM_BUILDS_LOADED,
        payload : { playgrounds }
      });
    }).catch((error)=> {});
  };
}

export function fetchTeamComments(payload=null) {
  return (dispatch, getState)=> {
    // const { team } = getState();
    const { team } = payload;

    logFormat('fetchTeamComments()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_COMMENTS',
      payload : {
        team_id : team.id
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'TEAM_COMMENTS', response.data);
      const { comments } = response.data;

      dispatch({
        type    : TEAM_COMMENTS_LOADED,
        payload : { comments }
      });
    }).catch((error)=> {});
  };
}

export function fetchTeamLogo(payload=null) {
  return (dispatch, getState)=> {
    const { team } = getState();

    logFormat('fetchTeamLogo()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_LOGO',
      payload : {
        team_id : team.id
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'TEAM_LOGO', response.data);
      const { logo } = response.data;

      dispatch({
        type    : TEAM_LOGO_LOADED,
        payload : { logo }
      });
    }).catch((error)=> {});
  };
}


export function fetchTeamLookup(payload=null) {
  const { userProfile } = payload || null;
  return (dispatch, getState)=> {
    logFormat('fetchTeamLookup()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_LOOKUP',
      payload : {
        user_id : userProfile.id,
        verbose : false
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'TEAM_LOOKUP', response.data);
      const { team } = response.data;

      dispatch({
        type    : TEAM_LOADED,
        payload : { team }
      });
    }).catch((error)=> {});
  };
}


export function fetchProducts(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchProducts()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'PRODUCTS',
      payload : null
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'PRODUCTS', response.data);

      dispatch({
        type    : PRODUCTS_LOADED,
        payload : { products : response.data.products.map((product)=> ({ ...product }).sort((i, j)=> (i.price < j.price) ? -1 : (i.price > j.price) ? 1 : 0)) }
      });
    }).catch((error)=> {});
  };
}

export function fetchUserProfile(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchUserProfile()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'USER_PROFILE',
      payload : { user_id : cookie.load('user_id') << 0 || 0 }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'USER_PROFILE', response.data);

      const { user } = response.data;


      if (user) {
        Objects.renameKey(user, 'github_auth', 'github');
        if (user.github) {
          Objects.renameKey(response.data.user.github, 'access_token', 'accessToken');
        }
      }

      const { id, type, github } = response.data.user;
      dispatch({
        type    : USER_PROFILE_LOADED,
        payload : {
          userProfile : { ...response.data.user,
            id     : id << 0,
            status : 0x00,
            github : (github) ? { ...github, id: github.id << 0 } : github,
            paid   : type.includes('paid')
          }
        }
      });
    }).catch((error)=> {});
  };
}

export function makeComment(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeComment()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { userProfile : profile, team, component } = getState();
    const { comment, content, position } = payload;
    
    axios.post(API_ENDPT_URL, {
      action  : 'ADD_COMMENT',
      payload : { content, 
        position     : (position || ((comment) ? comment.position : { x : 0, y : 0 })),
        user_id      : profile.id,
        team_id      : (component) ? 0 : team.id,
        component_id : (component) ? component.id : 0,
        comment_id   : (comment) ? comment.id : 0
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'ADD_COMMENT', response.data, response.data.comment);

      dispatch({
        type    : (!comment) ? COMMENT_ADDED : COMMENT_UPDATED,
        payload : { comment : response.data.comment }
      });
    }).catch((error)=> {});
  });
}


export function makeTeamRule(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeTeamRule()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { userProfile : profile, team } = getState();
    const { title } = payload;
    
    axios.post(API_ENDPT_URL, {
      action  : 'ADD_RULE',
      payload : { title,
        user_id : profile.id,
        team_id : team.id
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'ADD_RULE', response.data, response.data.comment);

      dispatch({
        type    : TEAM_RULES_UPDATED,
        payload : { rules : response.data.rules }
      });
    }).catch((error)=> {});
  });
}


export function makeVote(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeVote()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    const { comment, action } = payload;
    const { userProfile } = getState();

    const score = (action === VOTE_ACTION_UP) ? 1 : (action === VOTE_ACTION_DOWN) ? -1 : 0;

    axios.post(API_ENDPT_URL, {
      action: 'VOTE_COMMENT',
      payload: { score,
        user_id    : userProfile.id,
        comment_id : comment.id
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'VOTE_COMMENT', response.data);

      dispatch({
        type    : COMMENT_UPDATED,
        payload : { comment : response.data.comment }
      });
    }).catch((error)=> {});
  });
}

export function modifyComment(payload) {
  return ((dispatch, getState)=> {
    logFormat('modifyComment()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    const { comment, action } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'UPDATE_COMMENT',
      payload : {
        comment_id : comment.id,
        state      : action
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'UPDATE_COMMENT', response.data);

      dispatch({
        type    : COMMENT_UPDATED,
        payload : { comment : response.data.comment }
      });

    }).catch((error)=> {});
  });
}


export function modifyTeam(payload) {
  return ((dispatch, getState)=> {
    logFormat('modifyTeam()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    
    const { userProfile, team } = getState();
    const { description, image } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'UPDATE_TEAM',
      payload : { description, 
        team_id     : team.id,
        user_id     : userProfile.id,
        image       : (image === null) ? false : (image === true)
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'UPDATE_TEAM', response.data);

      dispatch({
        type    : TEAM_UPDATED,
        payload : { team : response.data.team }
      });

    }).catch((error)=> {});
  });
}


export function setInvite(payload) {
  logFormat('setInvite()', null, payload);
  const invite = payload;
  return { payload : { invite }, type : SET_INVITE };
}

export function setPlayground(payload) {
  return ((dispatch, getState)=> {
    logFormat('setPlayground()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const playground = payload;
    dispatch({
        type    : SET_PLAYGROUND,
        payload : { playground }
      });
  });
}

export function setTypeGroup(payload) {
  logFormat('setTypeGroup()', null, payload);
  const typeGroup = payload;
  return { payload : { typeGroup }, type : SET_TYPE_GROUP };
}

export function setComponent(payload) {
  logFormat('setComponent()', null, payload);
  const component = payload;
  return { payload : { component }, type : SET_COMPONENT };
}

export function setComment(payload) {
  logFormat('setComment()', null, payload);
  const comment = payload;
  return ({ 
    payload : { comment }, 
    type    : SET_COMMENT 
  });
}


export function setTeam(payload) {
  logFormat('setTeam()', null, payload);
  const team = payload;
  return ({ 
    payload : { team }, 
    type    : SET_TEAM
  });
}

export function setRedirectURI(payload) {
  const redrectURL = payload;
  return { redrectURL, type : SET_REDIRECT_URI };
}

export function toggleTheme(payload=null) {
  logFormat('toggleTheme()', null, payload);
  const theme = payload;
  return { theme, type : TOGGLE_THEME };
}

export function updateMatchPath(payload=null) {
  // logFormat('updateMatchPath()', null, payload, { type : typeof payload, len : Object.keys(payload).length, empty : (payload === null)});

  return ((dispatch, getState)=> {
    logFormat('updateMatchPath()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    
    const { matchPath } = payload;
    // const comps = (getState().matchPath) ? Object.keys(matchPath.params).map((key)=> (`${key} : ${matchPath.params[key]} ${getState().matchPath.params[key]} (${matchPath.params[key] === getState().matchPath.params[key]})`)) : null;
    const paramChange = (getState().matchPath) ? (Object.keys(matchPath.params).map((key)=> (matchPath.params[key] === getState().matchPath.params[key])).reduce((acc, val)=> (acc * val), 1) === 0) : true;

    // console.log('\t', LOG_ACTION_POSTFIX, { store : (getState().matchPath) ? { params : getState().matchPath.params, referer : getState().matchPath.location.state.referer } : null, payload : { params : payload.matchPath.params, referer : payload.matchPath.location.state.referer }}, { change : paramChange, comps }, LOG_ACTION_PREFIX);

    if (paramChange) {
      dispatch({
        type    : UPDATE_MATCH_PATH,
        payload : { matchPath }
      });
    
    } else {
      return;
    }
  });
}

export function updateMouseCoords(payload) {
  // 	logFormat('updateMouseCoords()', payload);
  const position = payload;
  return { payload : position, type : UPDATE_MOUSE_COORDS };
}


export function updateResizeBounds(payload) {
  // 	logFormat('updateResizeBounds()', payload);
  const resizeBounds = payload;
  return { payload : resizeBounds, type : UPDATE_RESIZE_BOUNDS };
}

export function updateUserProfile(payload, force=true) {
  logFormat('updateUserProfile()', null, payload, force);

  const userProfile = payload;

  if (payload) {
    Objects.renameKey(payload, 'github_auth', 'github');

    if (payload.github) {
      Objects.renameKey(payload.github, 'access_token', 'accessToken');
    }

    const { id, github } = payload;
    payload = { ...payload,
      id     : id << 0,
      github : (github) ? { ...github,
        id : github.id << 0
      } : github
    };

    if (payload.hasOwnProperty('password') && payload.password === '') {
      delete (payload.password);
    }
  }

  if (!force) {
    return (dispatch)=> {
      dispatch({ payload, type : USER_PROFILE_UPDATED });
    };
  }

  return (dispatch)=> {
    if (payload) {
      const { id, avatar } = payload;
      axios.post(API_ENDPT_URL, {
        action  : 'UPDATE_USER_PROFILE',
        payload : { ...payload,
          user_id  : id,
					filename : avatar
        }
      }).then((response)=> {
        console.log(API_RESPONSE_PREFIX, 'UPDATE_USER_PROFILE', response.data);

        const status = parseInt(response.data.status, 16);
        Objects.renameKey(response.data.user, 'github_auth', 'github');
        if (response.data.user.github) {
          Objects.renameKey(response.data.user.github, 'access_token', 'accessToken');
        }

        if (status === 0x00) {
        }

        const { id, username, email, type, github } = response.data.user;
        dispatch({
          type    : (status === 0x00) ? USER_PROFILE_UPDATED : USER_PROFILE_ERROR,
          payload : { ...response.data.user,
            status   : status,
            id       : id << 0,
            username : (Bits.contains(status, 0x01)) ? 'Username Already in Use' : username,
            email    : (Bits.contains(status, 0x10)) ? 'Email Already in Use' : email,
            github   : (github) ? { ...github, id: github.id << 0 } : github,
            paid     : type.includes('paid')
          }
        });
      }).catch((error)=> {});

    } else {
      cookie.save('user_id', '0', { path : '/', sameSite : false });

      dispatch({
        type    : USER_PROFILE_UPDATED,
        payload : null
      });
    }
  };
}
