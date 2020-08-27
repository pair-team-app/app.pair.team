

// import moment from 'moment';
import { Arrays, Bits } from 'lang-js-utils';
import { push, replace } from 'connected-react-router';
import cookie from 'react-cookies';
import { matchPath } from 'react-router-dom';

import { RoutePaths } from '../../components/helpers/Routes';
import { fetchTeamBuilds, fetchUserTeams, setRoutePath } from '../actions';
import { STRIPE_SESSION_PAID, BUILD_PLAYGROUNDS_LOADED, INVITE_LOADED, COMMENT_CREATED, COMMENT_ADDED, COMMENT_UPDATED, COMMENT_VOTED, DEVICES_LOADED, SET_COMMENT, SET_COMPONENT, SET_PLAYGROUND, SET_TEAM, SET_TYPE_GROUP, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_CREATED, TEAM_UPDATED, UPDATE_MOUSE_COORDS, UPDATE_RESIZE_BOUNDS, USER_PROFILE_LOADED, USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_MIDDLEWARE_POSTFIX, LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';
import { Modals, Pages } from '../../consts/uris';
import { makeAvatar } from '../../utils/funcs';
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
      // return (action(dispatch, store.getState));
    }

    // next(action);

    if (type === DEVICES_LOADED) {
      const { devices } = payload;
      payload.devices = devices.map((device)=> ({ ...device, scale : parseFloat(device.scale) })).sort((i, ii)=> ((i.title < ii.title) ? -1 : (i.title > ii.title) ? 1 : 0));

    } else if (type === USER_PROFILE_LOADED) {
      const { pathname, hash } = prevState.router.location;
      const { profile } = payload;
      const { id, state } = profile;

      cookie.save('user_id', (profile) ? profile.id : '0', { path : '/', sameSite : false });

      if (profile) {
        payload.profile = { ...profile,
          id        : id << 0,
          status    : 0x00,
          validated : (state === 2),
          avatar    : makeAvatar(profile.email)
        };

        dispatch(fetchUserTeams({ profile }));

        // if (showingEntryModal(hash)) {
        //   dispatch(replace(pathname));
        // }
      }

    } else if (type === USER_PROFILE_UPDATED) {
      const { profile } = payload;
      const { password } = prevState.user;

      cookie.save('user_id', (profile) ? profile.id : '0', { path : '/', sameSite : false });

      if (profile) {
        const status = parseInt(payload.status, 16);
        const { id, username, email, state } = profile;

        payload.password = (profile.password || password);
        payload.profile = { ...profile,
          status    : status,
          id        : id << 0,
          username  : (Bits.contains(status, 0x01)) ? 'Username Already in Use' : username,
          email     : (Bits.contains(status, 0x10)) ? 'Email Already in Use' : email,
          validated : ((state << 0) === 2)
        };

        delete (payload.profile['password']);
        dispatch(fetchUserTeams({ profile }));

      } else {
        if (prevState.user) {
          dispatch(push(`${Pages.TEAM}${Modals.LOGIN}`));
        }
      }

    } else if (type === TEAMS_LOADED) {
      const { profile } = prevState.user;
      // const { params } = prevState.path;
      const { pathname, hash } = prevState.router.location;

      payload.team = null;
      payload.member = null;

      const { teams } = payload;
      payload.teams = teams.map((team)=> (reformTeam(team))).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0));

      // match params
      const createMatch = matchPath(pathname, {
        path   : RoutePaths.CREATE,
        exact  : false,
        strict : false
      });

      const projectMatch = matchPath(pathname, {
        path   : RoutePaths.PROJECT,
        exact  : true,
        strict : true
      });

      const teamMatch = matchPath(pathname, {
        path   : RoutePaths.TEAM,
        exact  : true,
        strict : true
      });

      const { params } = (projectMatch || (teamMatch || { params : null }));
      if (!createMatch && payload.teams.length > 0) {
        // const team = (params) ? (payload.teams.find(({ id })=> (id === params.teamID)) || [ ...payload.teams].shift()) : [ ...payload.teams].shift();
        const team = (params) ? (payload.teams.find(({ id })=> (id === (params.teamID << 0))) || [ ...payload.teams].shift()) : [ ...payload.teams].shift();
        payload.team = team;

        console.log('______________________', { params, team });

        payload.teams = payload.teams.map((item)=> ({ ...item,
          selected : (team && item.id === team.id)
        }));

        const member = team.members.find(({ id })=> (id === profile.id));
        payload.member = member;

        if (!params || (params.teamID << 0) !== team.id || params.teamSlug !== team.slug) {
        // if (!params) {
          dispatch(replace(`${Pages.TEAM}/${team.id}--${team.slug}${hash}`));
        }

        const buildID = 0;
        const deviceSlug = '';
        dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));
      }

    } else if (type === TEAM_LOGO_LOADED) {
      const { logo } = payload;
      const { team } = prevState.teams;

      payload.team = { ...team, logo : logo.replace(/\\n/g, '', logo) };

    } else if (type === TEAM_BUILDS_LOADED) {
      // const { params } = prevState.path;
      const { team } = prevState.teams;
      const { pathname } = prevState.router.location;
      const { devices, componentTypes } = prevState.builds;

      // match params
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


      const playgrounds = [ ...payload.playgrounds].map((playground)=> (reformPlayground(playground, devices, componentTypes, team)));
      payload.playgrounds = playgrounds;//.sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));
      payload.playground = null;

      const { params } = (projectMatch || (teamMatch || { params : null }));
      console.log('______________________', { params });

      if (params) {
        if (params.buildID) {
          const playground = { ...playgrounds.find(({ buildID, device })=> (buildID === (params.buildID << 0) && device.slug === params.deviceSlug)), selected : true };

          payload.playground = { ...playground, selected : true };
          payload.playgrounds = playgrounds.map((item)=> ((playground && item.id === playground.id) ? payload.playground : { ...item,
            selected : false
          }));

          if (playground && params.componentID) {
            const component = { ...playground.components.find(({ id })=> (id === (params.componentID << 0))), selected : true };
            payload.component = component;

            if (component && params.comments && params.commentID) {
              const comment = component.comments.find(({ id })=> (id === (params.commentID << 0)));
              payload.comment = (comment || null);
            }
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
        const comments = payload.comments.map((comment, i)=> (reformComment(comment, `${Pages.TEAM}/${team.id}--${team.slug}/comments`)));

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

      const playgrounds = [ ...payload.playgrounds.map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team, { selected : false })))];
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
      const { pathname, hash } = prevState.router.location;
      const { comment } = prevState.comments;
      const { team } = prevState.teams;
      const { preComment } = payload;

      payload.comment = null;
      dispatch(push((preComment) ? `${Pages.TEAM}/${team.id}--${team.slug}/${Modals.FILE_DROP}` : `${Pages.TEAM}/${team.id}--${team.slug}`));

    } else if (type === COMMENT_ADDED) {
      const { team } = prevState.teams;
      const { component } = prevState.builds;

      payload.team = { ...team,
        comments : [ ...team.comments, reformComment(payload.comment, `${Pages.TEAM}/${team.id}--${team.slug}/comments`)]
      };

      if (component) {
        payload.component = { ...component,
          comments : [reformComment(payload.comment, `${Pages.TEAM}/${team.id}--${team.slug}/comments`), ...component.comments]
        }
      }

    } else if (type === COMMENT_UPDATED) {
      const { team } = prevState.teams;
      const comment = reformComment(payload.comment, `${Pages.TEAM}/${team.id}--${team.slug}/comments`);

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
      const deviceSlug = '';

      if (payload.team) {
        dispatch(push(`${Pages.TEAM}/${payload.team.id}--${payload.team.slug}`));
        dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));
        // dispatch(fetchTeamComments({ team : payload.team, verbose : true }));
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
        dispatch(push(`${Pages.TEAM}/${team.id}--${team.slug}/project/${payload.playground.buildID}--${payload.playground.slug}/${payload.playground.device.slug}`));
      }

    } else if (type === SET_TYPE_GROUP) {
    } else if (type === SET_COMPONENT) {
      const { component } = payload;
      const { team } = prevState.teams;
      const { playground } = prevState.builds;

      if (component) {
        dispatch(push(`${Pages.TEAM}/${team.id}--${team.slug}/project/${playground.buildID}--${playground.slug}/${playground.device.slug}/${component.id}`));
      }

    } else if (type === SET_COMMENT) {
      const { comment } = payload;

      const { team } = prevState.teams;
      const { playground, component } = prevState.builds;

      if (comment) {
        if (playground) {
          dispatch(push(`${Pages.TEAM}/${team.id}--${team.slug}/project/${playground.buildID}--${playground.slug}/${playground.device.slug}/${component.id}/comments/${comment.id}`));

        } else {
          dispatch(push(`${Pages.TEAM}/${team.id}--${team.slug}/comments/${comment.id}`));
        }
      }

    } else if (type === '@@router/LOCATION_CHANGE') {
      const { urlHistory } = prevState.path;

      const { state } = prevState.router.location;
      const { profile } = prevState.user;
      const { teams } = prevState.teams;
      const { playgrounds } = prevState.builds;
      const { preComment, commment } = prevState.comments;

      const { action, isFirstRendering, location } = payload;
      const { pathname, hash } = location;

      // match params
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

      // payload props cleared
      payload.teams = (teams) ? teams.map((team)=> ({ ...team, selected : false })) : null;
      payload.team = null;
      payload.member= null;
      payload.comment = null;
      payload.preComment = null;

      payload.playgrounds = playgrounds;
      payload.playground = prevState.builds.playground;
      payload.component =  prevState.builds.component;

      payload.urlHistory = (urlHistory) ? [ ...urlHistory, { ...payload.location, state : null }] : [{ ...payload.location, state : null }];

     // duplicate router change, ABORT
     if (!isFirstRendering && payload.location.state && state && pathname === [ ...payload.location.state].pop().pathname && hash === [ ...payload.location.state].pop().hash) {
       console.log('[|:|]=-=-=-=-=-=ABORT-ROUTE=-=-=-=-=-=-=[%s]=-=(%d)', action, (state) ? state.length : 0, { isFirstRendering, cookie : ((cookie.load('user_id') << 0) === 0), pathname, hash, state, profile, createMatch, teamMatch, projectMatch });

      //  dispatch (next(action));
     }

      console.log('[|:|]=-=-=-=-=-=LOCATION=-=-=-=-=-=-=[%s]=-=(%d)', action, (state) ? state.length : 0, { isFirstRendering, cookie : ((cookie.load('user_id') << 0) === 0), pathname, hash, state, profile, createMatch, teamMatch, projectMatch });

      if (isFirstRendering) {
        console.log('\\\\\\\\\\\\\\\\\\\\', 'FIRST LOCATION RENDER', { pathname, hash, cookie : ((cookie.load('user_id') << 0) === 0) }, '\\\\\\\\\\\\\\\\\\\\');

        payload.urlHistory = [{ ...payload.location, state : null }];

        if ((cookie.load('user_id') << 0 === 0) && !showingEntryModal(hash)) {
          dispatch(push(`${Pages.TEAM}${Modals.LOGIN}`));
        }
      }

      console.log('[::::||::::]',' LOCATION HISTORY', '[::::||::::]', { payloadLocState : payload.location.state, prevLocState : state });

      // abort and return to team root w/ existing
      if (!pathname.startsWith(Pages.TEAM) && !pathname.startsWith(Pages.CREATE)) {
        console.log('///-///', 'NOT TEAM PAGE', { pathname, hash }, '///-///');
      }

      if (!isFirstRendering && profile) {

        // back nav
        if (action === 'POP') {
          if (!isFirstRendering) {

            // has history
            if (payload.urlHistory !== null && payload.urlHistory.length >= 1) {
              // const prevLocation = [ ...payload.location.state].pop();
              const prevURL = payload.urlHistory.pop();

              // replace with history
              if (location.key !== prevURL.key) {
                payload.location = prevURL;
              }

            // no history
            } else {

            }
          }

        // fwd nav
        } else if (action === 'PUSH' || action === 'REPLACE') {

          // not valid page / param url
          if (!teamMatch && !createMatch && !projectMatch) {
            console.log('///-///', 'NON-TEAM PARAM URL', { pathname, hash }, '///-///');

            // dispatch(setRoutePath({
            //   params : {
            //     teamID       : null,
            //     teamSlug     : null,
            //     buildID      : null,
            //     projectSlug  : null,
            //     deviceSlug   : null,
            //     componentID  : null,
            //     comments     : null,
            //     commentID    : null
            //   }
            // }));

            // if ((state !== null || state === undefined) && state.length >= 1) {
              // const prevLocation = [ ...state].pop();
              // return (dispatch(push(prevLocation)));
              // push(prevLocation));

              // push the prev location
              // const redirLocation = (parseInt(cookie.load('user_id')) > 0 || profile) ? `${Pages.TEAM}${hash}` : `${Pages.TEAM}${Modals.LOGIN}`
              // return (dispatch(push(redirLocation)));
            // }
          }



          // push last location onto state
          payload.location = { ...location,
            // state : Arrays.pruneObjDupKeys((!state) ? [{ ...location, state : null }] : [ ...state, { ...prevState.router.location }], 'key')
            state : Arrays.pruneObjDupKeys((!urlHistory) ? [{ ...location, state : null }] : [ ...urlHistory, { ...prevState.router.location }], 'key')
          };

        } else if (action === 'REPLACE') {
          // payload.location = { ...location,
            // state : Arrays.pruneObjDupKeys((!state) ? [{ ...location, state : null }] : [ ...state, { ...prevState.router.location }], 'key')
          // };
        }
      }

      // passed url params
      console.log('///-///', 'ROUTER CHANGE', { playgrounds }, { pathname, hash, urlHistory }, '///-///');

      // logged in
      if (profile) {

        if (!isFirstRendering && projectMatch) {
          const playground = (playgrounds.find((playground)=> (playground.buildID === (projectMatch.params.buildID << 0) && playground.device.slug === projectMatch.params.deviceSlug)) || null);
          const component = (playground && projectMatch.params.componentID) ? (playground.components.find(({ id })=> (id === (projectMatch.params.componentID << 0))) || null) : null;
          const comment = (component && projectMatch.params.commentID) ? (component.comments.find(({ id })=> (id === (projectMatch.params.commentID << 0))) || null) : null;

          payload.playground = playground;
          payload.component = component;
          payload.comment = comment;
        }

        // on team page
        if (teamMatch) {
          // clear precomment if not in path
          payload.preComment = (hash === Modals.FILE_DROP) ? preComment : null;

          // has completed team fetch
          if (teams) {
            const team = { ...teams.find(({ id, slug })=> (id === (teamMatch.params.teamID << 0) && teamMatch.params.teamSlug === slug)), selected : true } || { ...[...teams].pop(), selected : true };
            console.log('≈~≈~≈~≈~≈~≈~≈~≈~≈~≈~≈~≈', { team });

            // found placeholder / one matching params
            if (team) {
              // const comments = teams.map(({ comments })=> (comments)).flat().map(({ replies, ...comment })=> ([comment, ...replies])).flat();

              // update payload team(s)
              payload.team = team;
              payload.teams = replaceArrayElement(teams, team, { selected : false });

              // search all team comments & their replies for param ID
              payload.comment = (teams.map(({ comments })=> (comments)).flat().map(({ replies, ...comment })=> ([comment, ...replies])).flat().find(({ id })=> (id === teamMatch.params.commentID)) || null);

              // set team role
              payload.member = (team.members.find(({ id })=> (id === profile.id)) || null)

              // replace w/ placeholder team
              if (team.id !== (teamMatch.params.teamID << 0) || team.slug !== teamMatch.params.teamSlug) {
                dispatch(push(`${Pages.TEAM}/${team.id}--${team.slug}${(teamMatch.params.commentID) ? `/comments/${payload.comment.id}` : ''}`));
              }
            }
          }
        }

        // on create page
        if (createMatch) {
          payload.team = null;
          payload.member = null;
          payload.comment = null;
          payload.preComment = null;
        }

      // no profile
      } else {



        // // no login-type modal
        // if(!existingModal) {
        //   return (dispatch(replace(`${Pages.TEAM}${Modals.LOGIN}`)));
        // }
      }

      if (profile && urlHistory && !payload.team && urlHistory.length === 1 && pathname === Pages.TEAM && !showingEntryModal(hash)) {
      console.log(':|:=-=:|:', 'STILL AINT GOT A TEAM TEAM PAGE YO!!!', ':|:=-=:|:', { profile, team : payload.team, pathname, hash, modals : showingEntryModal(hash) })

      }

      if (!payload.team) {
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

      } else {
        // start fetching team data
        dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));
        // dispatch(fetchTeamComments({ team : payload.team, verbose : true }));


        dispatch(setRoutePath({ ...teamMatch,
          params : { ...teamMatch.params,
            teamID       : (teamMatch.params.teamID << 0 || null),
            teamSlug     : (teamMatch.params.teamSlug || null),
            buildID      : (projectMatch) ? (projectMatch.params.buildID << 0 || null) : null,
            projectSlug  : (projectMatch) ? (projectMatch.params.projectSlug || null) : null,
            deviceSlug   : (projectMatch) ? (projectMatch.params.deviceSlug || null) : null,
            componentID  : (projectMatch) ? (projectMatch.params.componentID << 0 || null) : null,
            comments     : (teamMatch.params.comments) ? (teamMatch.params.comments === true) : false,
            commentID    : (teamMatch.params.commentID << 0 || null)
          }
        }));
      }
    }

    next(action);

    // const postState = store.getState();
    // const { devices, componentTypes, team } = postState;

    logFormat({ store, action, next, meta : 'POST [==>' });
  });
}


export const showingEntryModal = (hash)=> {
  return (([Modals.LOGIN, Modals.RECOVER, Modals.REGISTER].filter((modal)=> (hash === modal)).lengh === 0));
};



const replaceArrayElement = (array, element, override={})=> {
  return (array.map((item)=> ((item.id === element.id) ? element : { ...item, ...override })));
};


const pageParamCheck = (pathname, { createPath, teamPath, projPath }={}, overrides={ exact : false, strict : false })=> {
  let matchBits = 0x000;


  const createMatch = (createPath || matchPath(pathname, {
    path : RoutePaths.CREATE,
    ...overrides
  }));

  const teamMatch = (teamPath || matchPath(pathname, {
    path : RoutePaths.TEAM,
    ...overrides
  }));

  const projectMatch = (projPath || matchPath(pathname, {
    path : RoutePaths.PROJECT,
    ...overrides
  }));


  matchBits ^= (0x001 * ((createMatch !== null) << 0));
  matchBits ^= (0x010 * ((teamMatch !== null) << 0));
  matchBits ^= (0x100 * ((projectMatch !== null) << 0));

  return (matchBits);

  // return (0x000 ^ (((teamMatch !== null) << 0) * 0x010) + (((projectMatch !== null) << 0) * 0x100) + (((createMatch !== null) << 0) * 0x001));


};


