import axios from 'axios';
import { Bits, Objects } from 'lang-js-utils';
import cookie from 'react-cookies';
import { 
  COMPONENT_TYPES_LOADED, EVENT_GROUPS_LOADED, DEVICES_LOADED, PRODUCTS_LOADED,
  TEAM_LOADED, TEAM_BUILDS_LOADED, BUILD_PLAYGROUNDS_LOADED, PLAYGROUND_LOADED, TEAM_COMMENTS_LOADED,
  SET_INVITE, SET_COMMENT, SET_COMPONENT, SET_PLAYGROUND, SET_TYPE_GROUP, SET_TEAM,
  USER_PROFILE_LOADED, USER_PROFILE_UPDATED, USER_PROFILE_ERROR,
  UPDATE_MOUSE_COORDS, UPDATE_MATCH_PATH, UPDATE_RESIZE_BOUNDS, SET_REDIRECT_URI, TOGGLE_THEME, TEAM_LOGO_LOADED, 
  COMMENT_ADDED, COMMENT_UPDATED
} from '../../consts/action-types';
import { LOG_ACTION_PREFIX } from '../../consts/log-ascii';
import { API_ENDPT_URL } from '../../consts/uris';
import { VOTE_ACTION_UP, VOTE_ACTION_DOWN, VOTE_ACTION_RETRACT } from '../../components/pages/PlaygroundPage/VoteComment';

const logFormat = (action, state, payload=null, meta='')=> {
  console.log(LOG_ACTION_PREFIX, `ACTION >> ${action}`, { payload : payload || {}, meta, state });
};


// these are all action CREATORS that rtrn a funct
export function fetchBuildPlaygrounds(payload=null) {
  const { buildID } = payload;
  return (dispatch, getState)=> {
    logFormat('fetchBuildPlaygrounds()', (typeof getState === 'function') ? getState() : getState, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'BUILD_PLAYGROUNDS',
      payload : {
        build_id : buildID
      }
    }).then(async (response)=> {
      console.log('BUILD_PLAYGROUNDS', response.data);
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
    logFormat('fetchComponentTypes()', (typeof getState === 'function') ? getState() : getState, payload);
    
    axios.post(API_ENDPT_URL, {
      action: 'COMPONENT_TYPES',
      payload: null
    }).then((response)=> {
      console.log('COMPONENT_TYPES', response.data);
      dispatch({
        type    : COMPONENT_TYPES_LOADED,
        payload : { componentTypes : response.data.component_types }
      });
    }).catch((error)=> {});
  };
}

export function fetchDevices(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchDevices()', (typeof getState === 'function') ? getState() : getState, payload);
    
    axios.post(API_ENDPT_URL, {
      action  : 'DEVICES',
      payload : null
    }).then((response)=> {
      console.log('DEVICES', response.data);
      const {devices } = response.data;

      dispatch({
        type    : DEVICES_LOADED,
        payload : { devices }
      });
    }).catch((error)=> {});
  };
}

export function fetchEventGroups(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchEventGroups()', (typeof getState === 'function') ? getState() : getState, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'EVENT_GROUPS',
      payload : null
    }).then((response)=> {
      console.log('EVENT_GROUPS', response.data);

      dispatch({
        type    : EVENT_GROUPS_LOADED,
        payload : { 
          eventGroups : response.data.event_groups.map((eventGroup)=> {
            const events = eventGroup.event_types;
            delete eventGroup['event_types'];

            return ({ ...eventGroup, events });
          })
        }});
    }).catch((error)=> {});
  };
}

// export function fetchPlayground(payload=null) {
//   return (dispatch, getState)=> {
//     logFormat('fetchPlayground()', (typeof getState === 'function') ? getState() : getState, payload);
    
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
    const { buildID, deviceSlug } = payload;
    const { team } = getState();

    logFormat('fetchTeamBuilds()', (typeof getState === 'function') ? getState() : getState, { payload });
    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_BUILDS',
      payload : {
        team_id  : team.id,
        build_id : buildID,
        device   : deviceSlug
      }
    }).then((response)=> {
      console.log('TEAM_BUILDS', response.data);
      const { playgrounds } = response.data;

      console.log('⟨⎝⎛:⎞⎠⟩', 'TEAM_BUILDS', { builds : [ ...playgrounds].map(({ build_id : buildID, id :  playgroundID, device_id : deviceID, team_id : teamID })=> ({ buildID, playgroundID, deviceID, teamID }))});

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

    logFormat('fetchTeamComments()', (typeof getState === 'function') ? getState() : getState, payload);
    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_COMMENTS',
      payload : {
        team_id : team.id
      }
    }).then((response)=> {
      console.log('TEAM_COMMENTS', response.data);
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

    logFormat('fetchTeamLogo()', (typeof getState === 'function') ? getState() : getState, payload);
    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_LOGO',
      payload : {
        team_id : team.id
      }
    }).then((response)=> {
      console.log('fetchTeamLogo', response.data);
      const { logo } = response.data;

      dispatch({
        type    : TEAM_LOGO_LOADED,
        payload : { logo }
      });
    }).catch((error)=> {});
  };
}


export function fetchTeamLookup(payload=null) {
  const { userProfile } = payload;
  return (dispatch, getState)=> {
    logFormat('fetchTeamLookup()', (typeof getState === 'function') ? getState() : getState, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_LOOKUP',
      payload : {
        user_id : userProfile.id,
        verbose : false
      }
    }).then((response)=> {
      console.log('TEAM_LOOKUP', response.data);
      const { team } = response.data;

      // if (team) {
      //   dispatch({
      //     type    : TEAM_LOADED,
      //     payload : { 
      //       team : { ...team,
      //         members : team.members.map((member)=> ({ ...member,
      //           id : member.id << 0
      //         }))
      //       }
      //     }
      //   });
      // }

      dispatch({
        type    : TEAM_LOADED,
        payload : { team }
      });
    }).catch((error)=> {});
  };
}


export function fetchProducts(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchProducts()', (typeof getState === 'function') ? getState() : getState, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'PRODUCTS',
      payload : null
    }).then((response)=> {
      console.log('PRODUCTS', response.data);

      dispatch({
        type    : PRODUCTS_LOADED,
        payload : { products : response.data.products.map((product)=> ({ ...product }).sort((i, j)=> (i.price < j.price) ? -1 : (i.price > j.price) ? 1 : 0)) }
      });
    }).catch((error)=> {});
  };
}

export function fetchUserProfile(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchUserProfile()', (typeof getState === 'function') ? getState() : getState, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'USER_PROFILE',
      payload : { user_id: cookie.load('user_id') << 0 }
    }).then((response)=> {
      console.log('USER_PROFILE', response.data);

      Objects.renameKey(response.data.user, 'github_auth', 'github');
      if (response.data.user.github) {
        Objects.renameKey(response.data.user.github, 'access_token', 'accessToken');
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
    logFormat('makeComment()', (typeof getState === 'function') ? getState() : getState, payload);

    const { userProfile : profile, team, component } = getState();
    const { comment, content, position } = payload;
    
    axios.post(API_ENDPT_URL, {
      action  : 'ADD_COMMENT',
      payload : { content, 
        position     : (position || null),
        user_id      : profile.id,
        team_id      : team.id,
        component_id : (component) ? component.id : 0,
        comment_id   : (comment) ? comment.id : 0
      }
    }).then((response)=> {
      console.log('ADD_COMMENT', response.data, response.data.comment);

      dispatch({
        type    : (!comment) ? COMMENT_ADDED : COMMENT_UPDATED,
        payload : { comment : response.data.comment }
      });
    }).catch((error)=> {});
  });
}

export function makeVote(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeVote()', (typeof getState === 'function') ? getState() : getState, payload);
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
      console.log('VOTE_COMMENT', response.data);

      dispatch({
        type    : COMMENT_UPDATED,
        payload : { comment : response.data.comment }
      });
    }).catch((error)=> {});
  });
}

export function modifyComment(payload) {
  return ((dispatch, getState)=> {
    logFormat('modifyComment()', (typeof getState === 'function') ? getState() : getState, payload);
    const { comment, action } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'UPDATE_COMMENT',
      payload : {
        comment_id : comment.id,
        state      : action
      }
    }).then((response)=> {
      console.log('UPDATE_COMMENT', response.data);

      dispatch({
        type    : COMMENT_UPDATED,
        payload : { comment : response.data.comment }
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
  logFormat('setPlayground()', null, payload);
  const playground = payload;
  return { payload : { playground }, type : SET_PLAYGROUND };
}

export function setTeam(payload) {
  logFormat('setTeam()', null, payload);
  const team = payload;
  return { payload : { team }, type : SET_TEAM };
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

export function setRedirectURI(payload) {
  const redrectURL = payload;
  return { redrectURL, type : SET_REDIRECT_URI };
}

export function toggleTheme(payload=null) {
  logFormat('toggleTheme()', null, payload);
  const theme = payload;
  return { theme, type : TOGGLE_THEME };
}

export function updateMatchPath(payload) {
  logFormat('updateMatchPath()', payload);
  return { payload, type : UPDATE_MATCH_PATH };
}

export function updateMouseCoords(payload) {
  // 	logFormat('updateMouseCoords()', payload);
  const position = payload;
  return { payload : position, type : UPDATE_MOUSE_COORDS };
}
export function updateResizeBounds(payload) {
  // 	logFormat('updateMouseCoords()', payload);
  const resizeBounds = payload;
  return { payload : resizeBounds, type : UPDATE_RESIZE_BOUNDS };
}

export function updateUserProfile(payload, force=true) {
  logFormat('updateUserProfile()', null, payload, force);

  // const { userProfile } = payload;

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
        console.log('UPDATE_USER_PROFILE', response.data);

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
