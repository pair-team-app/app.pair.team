

// import moment from 'moment';
import { Bits } from 'lang-js-utils';
import { push, replace } from 'connected-react-router';
import cookie from 'react-cookies';
import { matchPath } from 'react-router-dom';

import { RoutePaths } from '../../components/helpers/Routes';
// import { fetchTeamBuilds, fetchTeamComments, fetchUserTeams, setRoutePath, setEntryHash } from '../actions';
import { fetchTeamBuilds, fetchUserTeams, setRoutePath, setEntryHash } from '../actions';
import { STRIPE_SESSION_PAID, BUILD_PLAYGROUNDS_LOADED, INVITE_LOADED, COMMENT_CREATED, COMMENT_ADDED, COMMENT_UPDATED, COMMENT_VOTED, DEVICES_LOADED, SET_COMMENT, SET_COMPONENT, SET_PLAYGROUND, SET_TEAM, SET_TYPE_GROUP, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_CREATED, TEAM_UPDATED, UPDATE_MOUSE_COORDS, UPDATE_RESIZE_BOUNDS, USER_PROFILE_LOADED, USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_MIDDLEWARE_POSTFIX, LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';
import { Modals, Pages } from '../../consts/uris';
// import { Pages } from '../../consts/uris';
import { reformComment, reformPlayground, reformRule, reformTeam, reformInvite } from '../../utils/reform';



const logFormat = ({ store, action, next, event })=> {
  if (action && typeof action !== 'function' && action.type !== UPDATE_MOUSE_COORDS) {
    const { type, payload } = action;

    if (event === 'PRE') {
      console.log(LOG_MIDDLEWARE_PREFIX, `“${type}”`, { action : (typeof action === 'function') ? { type, payload } : action, ofType : typeof action }, { store : store.getState(), next, action });

    } else {
      console.log(LOG_MIDDLEWARE_POSTFIX, `“${type}”`, { action : (typeof action === 'function') ? { type, payload } : action, ofType : typeof action }, { store : store.getState(), next, action });
    }



    // console.log((event === 'PRE') ? LOG_MIDDLEWARE_PREFIX : '', `“${type}”`, { action : (typeof action === 'function') ? action : { type, payload }, ofType : typeof action }, { store : (event === 'POST') ? store.getState() : store.getState, next, action }, (event === 'POST' ? LOG_MIDDLEWARE_POSTFIX : ''));
  }
};


export function onMiddleware(store) {
  return ((next)=> (action)=> {
    const prevState = store.getState();
    const { dispatch } = store;

    const { type, payload } = action;
    logFormat({ store, action, next, event : 'PRE' });


    if (typeof action === 'function') {
      // next(action);
      // return (action(dispatch, { ...prevState }));
      return (action(dispatch, store.getState));
    }

    // next(action);

    if (type === DEVICES_LOADED) {
      const { devices } = payload;
      payload.devices = devices.map((device)=> ({ ...device, scale : parseFloat(device.scale) })).sort((i, ii)=> ((i.title < ii.title) ? -1 : (i.title > ii.title) ? 1 : 0));

    } else if (type === USER_PROFILE_LOADED) {
      const { profile } = payload;
      const { id, state } = profile;

      cookie.save('user_id', (profile) ? profile.id : '0', { path : '/', sameSite : false });

      if (profile) {
        payload.profile = { ...profile,
          id        : id << 0,
          status    : 0x00,
          validated : (state === 2)
        };

        dispatch(fetchUserTeams({ profile }));
      }

    } else if (type === USER_PROFILE_UPDATED) {
      const { profile } = payload;

      cookie.save('user_id', (profile) ? profile.id : '0', { path : '/', sameSite : false });

      if (profile) {
        const status = parseInt(payload.status, 16);
        const { id, username, email, state } = profile;

        payload.profile = { ...profile,
          status    : status,
          id        : id << 0,
          username  : (Bits.contains(status, 0x01)) ? 'Username Already in Use' : username,
          email     : (Bits.contains(status, 0x10)) ? 'Email Already in Use' : email,
          validated : ((state << 0) === 2)
        };

        dispatch(fetchUserTeams({ profile }));

      } else {
        dispatch(push(`${Pages.TEAM}${Modals.LOGIN}`));
      }

    } else if (type === TEAMS_LOADED) {
      const { profile } = prevState.user;
      const { params } = prevState.path;
      const { pathname } = prevState.router.location;

      const { teams } = payload;
      payload.teams = teams.map((team)=> (reformTeam(team))).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0));

      const createMatch = matchPath(pathname, {
        path   : RoutePaths.CREATE,
        exact  : false,
        strict : false
      });

      if (!createMatch) {
        const team = (params) ? (payload.teams.find(({ id })=> (id === params.teamID)) || [ ...payload.teams].shift()) : [ ...payload.teams].shift();
        payload.team = team;

        payload.teams = payload.teams.map((item)=> ({ ...item,
          selected : (team && item.id === team.id)
        }));

        const member = team.members.find(({ id })=> (id === profile.id));
        payload.member = member;

        // if (!params || params.teamID !== team.id) {
          dispatch(push(`${Pages.TEAM}/${team.id}--${team.slug}`));
        // }

        const buildID = 0;
        const deviceSlug = '';
        dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));

      } else {
        payload.team = null;
        payload.member = null;
      }

    } else if (type === TEAM_LOGO_LOADED) {
      const { logo } = payload;
      const { team } = prevState.teams;

      payload.team = { ...team, logo : logo.replace(/\\n/g, '', logo) };

    } else if (type === TEAM_BUILDS_LOADED) {
      const { params } = prevState.path;
      const { team } = prevState.teams;
      const { devices, componentTypes } = prevState.builds;


      const playgrounds = [ ...payload.playgrounds].map((playground)=> (reformPlayground(playground, devices, componentTypes, team)));
      payload.playgrounds = playgrounds;//.sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));
      payload.playground = null;

      if (params) {
        if (params.buildID) {
          const playground = { ...playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)), selected : true };
          console.log('______________________', { playground });
          payload.playground = { ...playground, selected : true };

          payload.playgrounds = playgrounds.map((item)=> ((playground && item.id === playground.id) ? payload.playground : { ...item,
            selected : false
          }));

          if (playground && params.componentID) {
            const component = { ...playground.components.find(({ id })=> (id === params.componentID)), selected : true };
            payload.component = component;
          }
        }
      }

    } else if (type === INVITE_LOADED) {
      payload.invite = reformInvite(payload.invite);
      payload.team = reformTeam(payload.invite.team);

    } else if (type === TEAM_COMMENTS_LOADED) {
      const { team } = prevState.teams;

      if (payload.comments.reduce((acc, val)=> (acc + (val << 0)), 0) !== 0) {
        // dispatch(fetchTeamComments({ team, verbose : true }));
        //// return (action(dispatch(fetchTeamComments({ team, verbose : true })), store.getState));

      } else {
        const comments = payload.comments.map((comment, i)=> (reformComment(comment, `${Pages.TEAM}/${team.slug}/comments`)));

        payload.team = (team) ? { ...team, comments } : null;
        payload.comments = comments;
        // payload.comments = [ ...prevState.comments, ...comments].map((comment, i, arr)=> ((arr.find(({ id }, ii)=> (i === ii))) ? comment : null));
      }
    } else if (type === BUILD_PLAYGROUNDS_LOADED) {
      const { devices, componentTypes } = prevState.builds;
      const { team } = prevState.teams;

      // const playgrounds = [ ...new Set([ ...prevState.builds.playgrounds, ...payload.playgrounds.map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team))).map((playground)=> ({ ...playground, selected : (playground.buildID === params.buildID)})).filter(({ id })=> (!prevState.playgrounds.map(({ id })=> (id)).includes(id)))])];
      // const components = [ ...prevState.builds.components, ...playgrounds.map(({ components })=> (components)).flat()].map((component, i, arr)=> ((arr.find(({ id }, ii)=> (i === ii))) ? component : null)).sort((i, ii)=> ((i.id < ii.id) ? -1 : (i > ii) ? 1 : 0));
      // const comments = [ ...prevState.comments.comments , ...components.map(({ comments })=> (comments)).flat()].map((comment, i, arr)=> ((arr.find(({ id }, ii)=> (i === ii))) ? comment : null));//loop thru parent and merge merge the dups (InviteForm) -->  .map((comment, i, flatComments)=> ((component.id === )))

      const playgrounds = [ ...payload.playgrounds.map((playground, i)=> (reformPlayground({ ...playground, selected : false }, devices, componentTypes, team)))];
      const components = [ ...playgrounds.map(({ components })=> (components)).flat()];
      const comments = null;//[ ...components.map(({ comments })=> (comments)).flat()];

      // const playground = null;// (params.projectSlug !== 'ask') ? playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)) || null : null;
      // const typeGroup = null;// (playground) ? (playground.typeGroups.find(({ key })=> (key === params.typeGroupSlug)) || playground.typeGroups.find(({ key })=> (key === 'views'))) : null;
      // const component = null;// (playground) ? playground.components.find(({ id })=> (id === params.componentID)) || null : null;
      // const comment = null;// (component) ? component.comments.find(({ id })=> (id === params.commentID)) || null : null;


      // payload.playgrounds = playgrounds.sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));
      payload.playgrounds = playgrounds;
      payload.components = components;
      payload.comments = comments;
      // payload.playground = playground;
      // payload.typeGroup = typeGroup;
      // payload.component = component;
      // payload.comment = comment;

    } else if (type === TEAM_CREATED) {
      const { profile } = prevState.user;
      const { teams } = prevState.teams;
      const { team } = payload;

      payload.team = reformTeam(team);
      payload.teams = [{ ...team, selected : true }, ...teams.map((item)=> ({ ...item, selected : false }))];

      const member = payload.team.members.find(({ id })=> (id === profile.id));
      payload.member = member;

      // dispatch(fetchUserTeams({ profile }));
      dispatch(push(`${Pages.TEAM}/${payload.team.id}--${payload.team.slug}`));

    } else if (type === UPDATE_MOUSE_COORDS) {
      const { speed } = prevState.mouse;
      payload.mouse = {
        position : { ...payload },
        speed    : {
          x : speed.x - payload.x,
          y : speed.y - payload.y
        }
      };

    } else if (type === UPDATE_RESIZE_BOUNDS) {
      payload.resizeBounds = payload.bounds;
      delete (payload.bounds);

    } else if (type === COMMENT_CREATED) {
      const { team } = prevState.teams;

      payload.comment = null;
      dispatch(push(`/team/${team.id}--${team.slug}`));

    } else if (type === COMMENT_ADDED) {
      const { team } = prevState.teams;

      payload.team = { ...team,
        comments : [ ...team.comments, reformComment(payload.comment, `${Pages.TEAM}/${team.slug}/comments`)]
      };

    } else if (type === COMMENT_UPDATED) {
      const { team } = prevState.teams;
      const comment = reformComment(payload.comment, `${Pages.TEAM}/${team.slug}/comments`);

      payload.comment = comment;
      payload.team = { ...team,
        comments : (comment.state === 'deleted') ? team.comments.filter(({ id })=> (id !== comment.id)) : [ ...team.comments.filter(({ id })=> (id !== comment.id)), payload.comment]
      };

    } else if (type === STRIPE_SESSION_PAID) {
      payload.team = reformTeam(payload.team);

    } else if (type === TEAM_RULES_UPDATED) {
      const { team } = prevState.teams;
      const { rules } = payload;

      payload.team = { ...team,
        rules : rules.map((rule)=> (reformRule(rule, team.members)))
      };

    } else if (type === TEAM_UPDATED) {
      const { team } = payload;
      payload.team = reformTeam(team);

    } else if (type === COMMENT_VOTED) {
      const { team } = prevState.teams;

      const prevComment = team.comments.find(({ id })=> (id === (payload.comment.id << 0)));
      payload.team = { ...team,
        comments : team.comments.map((comment)=> ((comment.id === prevComment.id) ? reformComment(payload.comment, prevComment.uri) : comment))
      };

    } else if (type === SET_TEAM) {
      const { profile } = prevState.user;
      const { teams } = prevState.teams;

      payload.teams = teams.map((team)=> ({ ...team,
        selected : (payload.team && team.id === payload.team.id)
      }));
      payload.team = (payload.team) ? payload.teams.find(({ id })=> (id === payload.team.id)) : null;

      const member = (payload.team) ? payload.team.members.find(({ id })=> (id === profile.id)) : null;
      payload.member = member;

      const buildID = 0;
      const deviceSlug = "";

      if (payload.team) {
        dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));
        // dispatch(fetchTeamComments({ team : payload.team, verbose : true }));
        dispatch(push(`/team/${payload.team.id}--${payload.team.slug}`));
      }

      payload.playgrounds = null;

    } else if (type === SET_PLAYGROUND) {
      const { playground } = payload;
      const { team } = prevState.teams;
      const { playgrounds } = prevState.builds;

      payload.playground = (playground) ? { ...playground,
        selected : true
      } : null;
      payload.playgrounds = (playgrounds) ? playgrounds.map((item)=> ((playground && item.id === playground.id) ? payload.playground : { ...item,
        selected : false
      })) : null;

      if (payload.playground) {
        dispatch(push(`/team/${team.id}--${team.slug}/project/${payload.playground.buildID}--${payload.playground.slug}/${payload.playground.device.slug}`));
      }

    } else if (type === SET_TYPE_GROUP) {
    } else if (type === SET_COMPONENT) {
      const { component } = payload;
      const { team } = prevState.teams;
      const { playground } = prevState.builds;

      if (payload.component) {
        dispatch(push(`/team/${team.id}--${team.slug}/project/${playground.buildID}--${playground.slug}/${playground.device.slug}/${component.id}`));
      }

    } else if (type === SET_COMMENT) {
      const { comment } = payload;

      const { team } = prevState.teams;
      const { playground, component } = prevState.builds;

      if (comment) {
        if (playground) {
          dispatch(push(`/team/${team.id}--${team.slug}/project/${playground.buildID}--${playground.slug}/${playground.device.slug}/${component.id}/comments/${comment.id}`));

        } else {
          dispatch(push(`/team/${team.id}--${team.slug}/comments/${comment.id}`));
        }
      }

    } else if (type === '@@router/LOCATION_CHANGE') {
      const { profile } = prevState.user;
      const { teams } = prevState.teams;
      const { action, isFirstRendering, location } = payload;
      const { pathname, hash } = location;


      if (isFirstRendering) {
        console.log('\\\\\\\\\\\\\\\\\\\\', 'FIRST RENDER', { pathname, hash }, '\\\\\\\\\\\\\\\\\\\\');

        if (hash.length > 0) {
          dispatch(setEntryHash({ hash }));
        }
      }

      const teamMatch = matchPath(pathname, {
        path   : RoutePaths.TEAM,
        exact  : true,
        strict : true
      });

      const projectMatch = matchPath(pathname, {
        path   : RoutePaths.PROJECT,
        exact  : true,
        strict : true
      });

      const createMatch = matchPath(pathname, {
        path   : RoutePaths.CREATE,
        exact  : true,
        strict : true
      });

      const buildID = (projectMatch) ? projectMatch.params.buildID << 0 : 0;
      const deviceSlug = (projectMatch) ? projectMatch.params.deviceSlug : '';

      console.log('[|:|]=-=-=-=-=-=-=-=-=-=-=-=[%s]', action, { pathname : `${location.pathname}${location.hash}`, isFirstRendering, createMatch, teamMatch, projectMatch });



      if (action === 'POP') {
        if (!teamMatch && !createMatch && !projectMatch) {
          console.log('///-///', 'NON-TEAM PARAM URL', { pathname, hash }, '///-///');

          if (!pathname.startsWith(Pages.TEAM)) {
            dispatch(replace(`${Pages.TEAM}${hash}`));
          }

        } else {
          if (!isFirstRendering) {
            console.log('///-///', 'ROUTER CHANGE', { pathname, hash }, '///-///');

            if (profile && teamMatch) {
              const team = { ...teams.find(({ id })=> (id === (teamMatch.params.teamID << 0))), selected : true };
              console.log('≈~≈~≈~≈~≈~≈~≈~≈~≈~≈~≈~≈', { team });

              if (profile && team) {
                payload.team = team;
                payload.teams = replaceArrayElement(teams, team, { selected : false });

                const member = team.members.find(({ id })=> (id === profile.id));
                payload.member = member;

                dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));
              // dispatch(fetchTeamComments({ team : payload.team, verbose : true }));
              }

            } else {
              dispatch(setRoutePath({
                params : {
                  teamID       : null,
                  teamSlug     : null,
                  buildID      : null,
                  projectSlug  : null,
                  deviceSlug   : null,
                  componentID  : null,
                  comments     : null,
                  commentID    : null
                }
              }));

              if (!profile) {
                return (dispatch(replace(`${Pages.TEAM}${Modals.LOGIN}`)));
              }
            }
          }

          if (projectMatch) {
            dispatch(setRoutePath({ ...projectMatch,
              params : { ...projectMatch.params,
                teamID       : (projectMatch.params.teamID << 0 || null),
                teamSlug     : (projectMatch.params.teamSlug || null),
                buildID      : (projectMatch.params.buildID << 0 || null),
                projectSlug  : (projectMatch.params.projectSlug || null),
                deviceSlug   : (projectMatch.params.deviceSlug || null),
                componentID  : (projectMatch.params.componentID << 0 || null),
                comments     : (projectMatch.params.comments) ? (projectMatch.params.comments === true) : false,
                commentID    : (projectMatch.params.commentID << 0 || null)
              }
            }));
          }

          if (teamMatch) {
            dispatch(setRoutePath({ ...teamMatch,
              params : { ...teamMatch.params,
                teamID       : (teamMatch.params.teamID << 0 || null),
                teamSlug     : (teamMatch.params.teamSlug || null),
                buildID      : null,
                projectSlug  : null,
                deviceSlug   : null,
                componentID  : null,
                comments     : (teamMatch.params.comments) ? (teamMatch.params.comments === true) : false,
                commentID    : (teamMatch.params.commentID << 0 || null)
              }
            }));
          }
        }
      }
    }

    next(action);

    // const postState = store.getState();
    // const { devices, componentTypes, team } = postState;

    logFormat({ store, action, next, meta : 'POST [==>' });
  });
}



const replaceArrayElement = (array, element, override={})=> {
  return (array.map((item)=> ((item.id === element.id) ? element : { ...item, ...override })));
};
