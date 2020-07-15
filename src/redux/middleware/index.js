

// import moment from 'moment';
import { push } from 'connected-react-router';
import cookie from 'react-cookies';

import { RoutePaths } from '../../components/helpers/Routes';
import { fetchBuildPlaygrounds, fetchTeamBuilds, fetchTeamComments, fetchTeamLookup } from '../actions';
import { STRIPE_SESSION_PAID, BUILD_PLAYGROUNDS_LOADED, INVITE_LOADED, COMMENT_ADDED, COMMENT_UPDATED, COMMENT_VOTED, DEVICES_LOADED, SET_COMMENT, SET_COMPONENT, SET_PLAYGROUND, SET_TEAM, SET_TYPE_GROUP, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, TEAMS_LOADED, TEAM_LOGO_LOADED, TEAM_RULES_UPDATED, TEAM_CREATED, TEAM_UPDATED, UPDATE_MOUSE_COORDS, UPDATE_RESIZE_BOUNDS, USER_PROFILE_LOADED, USER_PROFILE_UPDATED } from '../../consts/action-types';
import { LOG_MIDDLEWARE_POSTFIX, LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';
import { Pages } from '../../consts/uris';
import { reformComment, reformPlayground, reformTeam, reformInvite } from '../../utils/reform';



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
      // const userProfile = payload;
      if (profile) {
        cookie.save('user_id', (profile) ? profile.id : '0', { path : '/', sameSite : false });
        dispatch(fetchTeamLookup({ profile }));
      }

      // payload = { userProfile };

    } else if (type === USER_PROFILE_UPDATED) {
      const profile = payload;
      if (profile) {
        cookie.save('user_id', (profile) ? profile.id : '0', { path : '/', sameSite : false });
        dispatch(fetchTeamLookup({ profile }));
      }

    } else if (type === TEAMS_LOADED) {
      const { team } = prevState.teams;

      const buildID = 0;
      const deviceSlug = "";

      const { teams } = payload;
      payload.teams = teams.map((team)=> (reformTeam(team))).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : 0)).map((team, i)=> ({ ...team, selected : (i === 0)}));
      payload.team = (team || (payload.teams.length > 0) ? [ ...payload.teams ].shift() : null);

      dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));
      dispatch(fetchTeamComments({ team : payload.team }));

    } else if (type === TEAM_LOGO_LOADED) {
      const { logo } = payload;
      const { team } = prevState.teams;

      payload.team = { ...team, logo : logo.replace(/\\n/g, '', logo) };

    } else if (type === TEAM_BUILDS_LOADED) {
      const { team } = prevState.teams;
      const { devices, componentTypes } = prevState.builds;


      const playgrounds = [ ...payload.playgrounds].map((playground)=> (reformPlayground({ ...playground }, devices, componentTypes, team)));
      payload.playgrounds = playgrounds;//.sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));

    } else if (type === INVITE_LOADED) {
      const invite = reformInvite(payload.invite);
      const team = reformTeam(payload.team);

      payload.invite = invite;
      payload.team = team;

    } else if (type === TEAM_COMMENTS_LOADED) {
      const { team } = prevState.teams;
      const verbose = payload.comments.reduce((acc, val)=> (acc + (val << 0)), 0);

      if (payload.comments.reduce((acc, val)=> (acc + (val << 0)), 0) !== 0) {
        // dispatch(fetchTeamComments({ team, verbose : true }));
        return (action(dispatch(fetchTeamComments({ team, verbose : true })), store.getState));

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

      const playgrounds = [ ...new Set([ ...prevState.builds.playgrounds, ...payload.playgrounds.map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team))).map((playground)=> ({ ...playground, selected : false})).filter(({ id })=> (!prevState.playgrounds.map(({ id })=> (id)).includes(id)))])];
      const components = [ ...prevState.builds.components, ...playgrounds.map(({ components })=> (components)).flat()].map((component, i, arr)=> ((arr.find(({ id }, ii)=> (i === ii))) ? component : null)).sort((i, ii)=> ((i.id < ii.id) ? -1 : (i > ii) ? 1 : 0));
      const comments = [ ...prevState.comments.comments , ...components.map(({ comments })=> (comments)).flat()].map((comment, i, arr)=> ((arr.find(({ id }, ii)=> (i === ii))) ? comment : null));//loop thru parent and merge merge the dups (InviteForm) -->  .map((comment, i, flatComments)=> ((component.id === )))

      const playground = null;// (params.projectSlug !== 'ask') ? playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)) || null : null;
      const typeGroup = null;// (playground) ? (playground.typeGroups.find(({ key })=> (key === params.typeGroupSlug)) || playground.typeGroups.find(({ key })=> (key === 'views'))) : null;
      const component = null;// (playground) ? playground.components.find(({ id })=> (id === params.componentID)) || null : null;
      const comment = null;// (component) ? component.comments.find(({ id })=> (id === params.commentID)) || null : null;


      payload.playgrounds = playgrounds.sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));
      payload.components = components;
      payload.comments = comments;
      payload.playground = playground;
      payload.typeGroup = typeGroup;
      payload.component = component;
      payload.comment = comment;

    } else if (type === TEAM_CREATED) {
      const { userProfile, team } = payload;
      dispatch(fetchTeamLookup({ userProfile }));

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

    } else if (type === COMMENT_ADDED) {
      const { team } = prevState.teams;
      const { component } = prevState.builds;

      const prevComment = prevState.comments.comments.comments.find(({ id })=> (id === (payload.comment.id << 0)));
      payload.comment = (prevComment) ? reformComment(payload.comment, prevComment.uri) : reformComment(payload.comment, `${Pages.TEAM}/${team.slug}/comments`);
      payload.comments = (prevComment) ? prevState.comments.comments.map((comment)=> ((comment.id === payload.comment.id) ? payload.comment : comment)) : [ ...prevState.comments, payload.comment];
      payload.component = (component) ? { ...component,
        comments : [ ...component.comments, payload.comment].sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : ((i.type === 'bot') ? -1 : (ii.type === 'bot') ? 1 : 0)))
      } : null;


    } else if (type === COMMENT_UPDATED) {
      const { component } = prevState.builds;
      const { comment } = prevState.comments;

      const prevComment = prevState.comments.comments.find(({ id })=> (id === (payload.comment.id << 0)));
      payload.comment = reformComment(payload.comment, prevComment.uri);

      if (payload.comment.state === 'deleted') {
        payload.comments = prevState.comments.comments.filter(({ id })=> (id !== payload.comment.id));

      } else {
        payload.comments = prevState.comments.comments.map((comment)=> ((comment.id === payload.comment.id) ? payload.comment : comment));
      }

      payload.component = (component) ? { ...component,
        comments : (payload.comment.state === 'deleted') ? component.comments.filter(({ id })=> (id !== payload.comment.id)) : component.comments.map((comment)=> ((comment.id === prevState.comments.comment.id) ? payload.comment : comment)).sort((i, ii)=> ((i.epoch > ii.epoch) ? -1 : (i.epoch < ii.epoch) ? 1 : ((i.type === 'bot') ? -1 : (ii.type === 'bot') ? 1 : 0)))
      } : null;

      payload.comment = (comment) ? payload.comment : null;

    } else if (type === STRIPE_SESSION_PAID) {
      payload.team = reformTeam(payload.team);

    } else if (type === TEAM_RULES_UPDATED) {
      const { team } = prevState.teams;
      const { rules } = payload;

      // payload.team = { ...team,
      //   rules : rules.map((rule)=> (reformRule(rule, team.members)))
      // };

      payload.team = { ...team, rules };

    } else if (type === TEAM_UPDATED) {
      const { team } = payload;
      payload.team = reformTeam(team);

    } else if (type === COMMENT_VOTED) {
      const { team } = prevState.teams;
      const { playgrounds, playground, typeGroup, component } = prevState.builds;

      let { comment } = payload
      if (comment.type === 'team') {
        comment = reformComment(comment, `${Pages.TEAM}/${team.slug}/comments`);

      } else if (comment.type === 'component') {
        let projectSlug = null;
        let buildID = null;
        let deviceSlug = null;
        let typeGroupSlug = null;
        let componentID = null;


        if (!component) {
          const components = playgrounds.map(({ components })=> (components)).flat();
          const comm = components.map(({ id, comments })=> ({ comments,
            componentID : id
          })).flat();//.find(({ id })=> (id === comment.id));

        } else {
          componentID = component.id;
        }

        if (playground) {
          projectSlug = playground.slug;
          buildID = playground.buildID;
          deviceSlug = playground.device.slug;

        } else {
          //componentID = playgrounds.
        }

        if (typeGroup) {
          typeGroupSlug = typeGroup.slug;
        }

        comment = reformComment(comment, `${Pages.PROJECT}/${playground.slug}/${playground.buildID}/${playground.device.slug}/${typeGroup.slug}/${component.id}/comments`);
      }


      payload.comment = comment;

    } else if (type === SET_TEAM) {
      const { teams } = prevState.teams;
      payload.teams = teams.map((team)=> ({ ...team,
        selected : (team.id === payload.team.id)
      }));
      payload.team = payload.teams.find(({ id })=> (id === payload.team.id));

      const buildID = 0;
      const deviceSlug = "";
      dispatch(fetchTeamBuilds({ team : payload.team, buildID, deviceSlug }));
      dispatch(fetchTeamComments({ team : payload.team, verbose : true }));
      dispatch(push(`/team/${payload.team.id}--${payload.team.slug}`));

    } else if (type === SET_PLAYGROUND) {
      const { playground } = payload;
      const { team } = prevState.teams;
      const { playgrounds } = prevState.builds;

      payload.playground = (playground) ? { ...playground,
        selected : true
      } : null;
      payload.playgrounds = playgrounds.map((item)=> ((playground && item.id === playground.id) ? payload.playground : { ...item,
        selected : false
      }));

      if (payload.playground) {
        dispatch(push(`/team/${team.id}--${team.slug}/project/${payload.playground.buildID}--${payload.playground.slug}/${payload.playground.device.slug}`));
      }

    } else if (type === SET_TYPE_GROUP) {
      const { typeGroup } = payload;

    } else if (type === SET_COMPONENT) {
      const { component } = payload;

    } else if (type === SET_COMMENT) {
      const { comment } = payload;

    } else if (type === '@@router/LOCATION_CHANGE') {
      const { action, isFirstRendering, location } = payload;

      if (action === 'POP') {
        if (isFirstRendering) {
          console.log('-=-=-=-=-=-=-=-=-=-=-=-=', { location : payload.location });

        } else {

        }
      }
    }

    next(action);

    const postState = store.getState();

    if (type === TEAM_BUILDS_LOADED) {
      const { devices, componentTypes, team } = postState;
    }

    logFormat({ store, action, next, meta : 'POST [==>' });
  });
}
