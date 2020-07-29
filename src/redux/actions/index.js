import axios from 'axios';
import { Bits } from 'lang-js-utils';
import cookie from 'react-cookies';
import { VOTE_ACTION_DOWN, VOTE_ACTION_UP } from '../../components/iterables/BaseComment';
import { BUILD_PLAYGROUNDS_LOADED, SET_TEAM_COMMENTS_SORT, INVITE_LOADED, INVITE_MODIFIED, COMMENT_ADDED, COMMENT_UPDATED, COMPONENT_TYPES_LOADED, DEVICES_LOADED, PRODUCTS_LOADED, SET_COMMENT, SET_COMPONENT, SET_INVITE, SET_PLAYGROUND, SET_ROUTE_PATH, SET_TEAM, SET_TYPE_GROUP, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_UPDATED, TOGGLE_THEME, UPDATE_MOUSE_COORDS, UPDATE_RESIZE_BOUNDS, USER_PROFILE_ERROR, USER_PROFILE_LOADED, USER_PROFILE_UPDATED, TEAM_CREATED, STRIPE_SESSION_CREATED, STRIPE_SESSION_PAID } from '../../consts/action-types';
import { API_RESPONSE_PREFIX, LOG_ACTION_POSTFIX, LOG_ACTION_PREFIX } from '../../consts/log-ascii';
import { API_ENDPT_URL } from '../../consts/uris';

const logFormat = (action, state, payload=null, meta='')=> {
  console.log(LOG_ACTION_PREFIX, `ACTION >> ${action}`, { payload : payload || {}, meta, state }, LOG_ACTION_POSTFIX);
};


export function fetchBuildPlaygrounds(payload=null) {
  const { buildID } = payload;
  return (dispatch, getState)=> {
    logFormat('fetchBuildPlaygrounds()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'BUILD_PLAYGROUNDS',
      payload : {
        build_id : buildID,
        verbose  : true
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

export function fetchInvite(payload=null) {
  const { inviteID } = payload;

  return (dispatch, getState)=> {
    logFormat('fetchInvite()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'INVITE_LOOKUP',
      payload : {
        invite_id : inviteID
      }
    }).then((response)=> {
      console.log('INVITE_LOOKUP', response.data);
      const { invite, team } = response.data;

      dispatch({
        type    : INVITE_LOADED,
        payload : { invite, team }
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


export function fetchProducts(payload=null) {
  return (dispatch, getState)=> {
    logFormat('fetchProducts()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'PRODUCTS',
      payload : null
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'PRODUCTS', response.data);
      const { products } = response.data;

      dispatch({
        type    : PRODUCTS_LOADED,
        payload : { products }
      });
    }).catch((error)=> {});
  };
}


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
    const { team, verbose } = payload;

    logFormat('fetchTeamComments()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    axios.post(API_ENDPT_URL, {
      action  : 'TEAM_COMMENTS',
      payload : {
        team_id : team.id,
        verbose : (verbose || false)
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


export function fetchUserTeams(payload=null) {
  const { profile } = payload || null;
  return (dispatch, getState)=> {
    logFormat('fetchUserTeams()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    axios.post(API_ENDPT_URL, {
      action  : 'USER_TEAMS',
      payload : {
        user_id : profile.id,
        verbose : false
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'USER_TEAMS', response.data);
      const { teams } = response.data;

      dispatch({
        type    : TEAMS_LOADED,
        payload : { teams }
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

      const { id } = response.data.user;
      dispatch({
        type    : USER_PROFILE_LOADED,
        payload : {
          profile : { ...response.data.user,
            id     : id << 0,
            status : 0x00
          }
        }
      });
    }).catch((error)=> {});
  };
}

export function makeComment(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeComment()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { profile } = getState().user;
    const { team } = getState().teams;
    const { component } = getState().builds;
    const { comment, content, format, position, image } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'ADD_COMMENT',
      payload : { content, format,
        image_url    : (image || null),
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
    }).catch((error)=> {
      console.log(API_RESPONSE_PREFIX, 'ADD_COMMENT >> ERROR', { error, payload : { content,
        position     : (position || ((comment) ? comment.position : { x : 0, y : 0 })),
        user_id      : profile.id,
        team_id      : (component) ? 0 : team.id,
        component_id : (component) ? component.id : 0,
        comment_id   : (comment) ? comment.id : 0
      } });
    });
  });
}


export function makeStripeSession(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeStripeSession()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { profile } = getState().user;
    const { team } = getState().teams;
    const { product } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'STRIPE_SESSION',
      payload : {
        team_id    : team.id,
        user_id    : profile.id,
        product_id : product.id,
        quantity   : team.members.length
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'STRIPE_SESSION', response.data);
      const { session } = response.data;

      dispatch({
        type    : STRIPE_SESSION_CREATED,
        payload : { session }
      });
    }).catch((error)=> {
      console.log(API_RESPONSE_PREFIX, 'STRIPE_SESSION >> ERROR', { error, payload : {
        team_id    : team.id,
        user_id    : profile.id,
        product_id : product.id,
        quantity   : team.members.length
      } });
    });
  });
}


export function makeTeam(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeTeam()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { profile } = getState().user;
    const { title, description, rules, invites } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'CREATE_TEAM',
      payload : { title, description, rules, invites,
        user_id : profile.id,
        image   : null
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'CREATE_TEAM', response.data, response.data.team);
      const { team } = response.data;

      dispatch({
        type    : TEAM_CREATED,
        payload : { profile, team }
      });
    }).catch((error)=> {
      console.log(API_RESPONSE_PREFIX, 'CREATE_TEAM >> ERROR', { error, payload : {
        title, description, rules, invites,
        user_id : profile.id,
        image   : null
      } });
    });
  });
}


export function makeTeamRule(payload) {
  return ((dispatch, getState)=> {
    logFormat('makeTeamRule()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { profile } = getState().user;
    const { team } = getState().teams;
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
    const { profile } = getState().user;

    const score = (action === VOTE_ACTION_UP) ? 1 : (action === VOTE_ACTION_DOWN) ? -1 : 0;

    axios.post(API_ENDPT_URL, {
      action: 'VOTE_COMMENT',
      payload: { score,
        user_id    : profile.id,
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

export function modifyInvite(payload) {
  return ((dispatch, getState)=> {
    logFormat('modifyInvite()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);
    const { invite, state } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'UPDATE_INVITE_STATE',
      payload : { state,
        invite_id : invite.id
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'UPDATE_INVITE_STATE', response.data);

      dispatch({
        type    : INVITE_MODIFIED,
        payload : null
      });

    }).catch((error)=> {});
  });
}


export function paidStripeSession(payload) {
  return ((dispatch, getState)=> {
    logFormat('paidStripeSession()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { sessionID } = payload;
    axios.post(API_ENDPT_URL, {
      action  : 'PAID_STRIPE_SESSION',
      payload : {
        purchase_id : 0,
        session_id  : sessionID
      }
    }).then((response)=> {
      console.log(API_RESPONSE_PREFIX, 'PAID_STRIPE_SESSION', response.data);
      const { purchase, team } = response.data;

      dispatch({
        type    : STRIPE_SESSION_PAID,
        payload : { purchase, team }
      });

    }).catch((error)=> {});
  });
}

export function modifyTeam(payload) {
  return ((dispatch, getState)=> {
    logFormat('modifyTeam()', { store : (typeof getState === 'function') ? getState() : getState, typeof : typeof getState }, payload);

    const { profile } = getState().user;
    const { team } = getState().teams;
    const { description, image } = payload;

    axios.post(API_ENDPT_URL, {
      action  : 'UPDATE_TEAM',
      payload : { description,
        team_id     : team.id,
        user_id     : profile.id,
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

export function setRoutePath(payload) {
  logFormat('setRoutePath()', null, payload);
  const { params } = payload;
  return { payload : { params }, type : SET_ROUTE_PATH };
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


export function setTeamCommentsSort(payload) {
  logFormat('setTeamCommentsSort()', null, payload);
  const { sort } = payload;
  return ({
    payload : { sort },
    type    : SET_TEAM_COMMENTS_SORT
  });
}


export function toggleTheme(payload=null) {
  logFormat('toggleTheme()', null, payload);
  const theme = payload;
  return { theme, type : TOGGLE_THEME };
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

  if (payload) {
    const { id } = payload;
    payload = { ...payload,
      id : id << 0
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
        if (status === 0x00) {
        }

        const { id, username, email } = response.data.user;
        dispatch({
          type    : (status === 0x00) ? USER_PROFILE_UPDATED : USER_PROFILE_ERROR,
          payload : { ...response.data.user,
            status   : status,
            id       : id << 0,
            username : (Bits.contains(status, 0x01)) ? 'Username Already in Use' : username,
            email    : (Bits.contains(status, 0x10)) ? 'Email Already in Use' : email
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
