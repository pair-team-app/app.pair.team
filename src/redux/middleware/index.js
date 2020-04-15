
// import moment from 'moment';
import cookie from 'react-cookies';
import { matchPath } from 'react-router-dom';

import { reformComponent, reformPlayground , reformComment} from '../../components/pages/PlaygroundPage/utils/reform';
import { DEVICES_LOADED,
  BUILD_PLAYGROUNDS_LOADED, 
  TEAM_LOADED, 
  TEAM_LOGO_LOADED, 
  TEAM_BUILDS_LOADED, 
  TEAM_COMMENTS_LOADED, 
  TYPE_GROUP_LOADED, 
  USER_PROFILE_UPDATED, 
  USER_PROFILE_LOADED, 
  UPDATE_MATCH_PATH,
  UPDATE_MOUSE_COORDS,
  SET_PLAYGROUND, SET_TYPE_GROUP, SET_COMPONENT, SET_COMMENT,
  COMMENT_VOTED, UPDATE_RESIZE_BOUNDS
} from '../../consts/action-types';
import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';
import { fetchTeamBuilds, fetchTeamComments, fetchTeamLogo, fetchTeamLookup, fetchBuildPlaygrounds, updateMatchPath, setTypeGroup, setComment, setComponent } from '../actions';
import { TEAM_DEFAULT_AVATAR, Pages } from '../../consts/uris';


const logFormat = ({ prevState, action, next, meta=null })=> {
  if (action && typeof action !== 'function' && action.type !== UPDATE_MOUSE_COORDS) {
    const { type, payload } = action;
    console.log(LOG_MIDDLEWARE_PREFIX, `“${type}”`, { payload, action, meta }, { prevState, next });
  }
};


export function onMiddleware(store) {
  return ((next)=> (action)=> {
    const prevState = store.getState();
    const { dispatch } = store;

    const { type, payload } = action;
    logFormat({ prevState, action, next });

    if (type === DEVICES_LOADED) {
      const { devices } = payload;
      payload.devices = devices.map((device)=> ({ ...device, scale : parseFloat(device.scale) })).sort((i, ii)=> ((i.title < ii.title) ? -1 : (i.title > ii.title) ? 1 : 0));

    } else if (type === USER_PROFILE_LOADED) {
      const { userProfile } = payload;
      // const userProfile = payload;
      if (userProfile) {
        cookie.save('user_id', (userProfile) ? userProfile.id : '0', { path : '/', sameSite : false });
        dispatch(fetchTeamLookup({ userProfile }));
      }

      // payload = { userProfile };

    } else if (type === USER_PROFILE_UPDATED) {
      const userProfile = payload;
      if (userProfile) {
        cookie.save('user_id', (userProfile) ? userProfile.id : '0', { path : '/', sameSite : false });
        dispatch(fetchTeamLookup({ userProfile }));
      }

    } else if (type === TEAM_LOADED) {
      const { params } = prevState.matchPath;
      const { buildID, deviceSlug } = params;
      
      const { team } = payload;
      payload.team = { ...team,
        id       : team.id << 0,
        members  : team.members.map((member)=> ({ ...member,
          id : member.id << 0
        })),
        logo     : team.image.replace(/\\n/g, '', team.image)
        // comments : (team.comments) ? team.comments.map((comment)=> (reformComment(comment, team))) : []
      };

      if (!team.image === TEAM_DEFAULT_AVATAR) {
        dispatch(fetchTeamLogo({ team }));
      }

      if (team.comments << 0 !== 0) {
        dispatch(fetchTeamComments({ team }));
      }

      dispatch(fetchTeamBuilds({ team, buildID, deviceSlug }));

    } else if (type === TEAM_LOGO_LOADED) {
      const { logo } = payload;
      const { team } = prevState;

      payload.team = { ...team, logo : logo.replace(/\\n/g, '', logo) };

    } else if (type === TYPE_GROUP_LOADED) {
      const { componentTypes, playground } = prevState;
      const components = [ ...new Set([ ...playground.components, ...payload.components.map((component)=> (reformComponent(component, componentTypes))) ])];

      playground.components = [ ...components ];
      payload.playgrounds = prevState.playgrounds.map((item)=> ((item.id === playground.id) ? playground : item)).sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));
      payload.playground = playground;
      
  
    } else if (type === TEAM_BUILDS_LOADED) {

      const { devices, componentTypes, team, matchPath } = prevState;
      const { params } = matchPath || {};

      // const playgrounds = [ ...payload.playgrounds].map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team)));//.map((playground)=> ({ ...playground, selected : (playground.buildID === params.buildID)}));
      const playgrounds = [ ...payload.playgrounds].map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team))).map((playground)=> ({ ...playground, selected : (playground.buildID === params.buildID)}));
      const components = [ ...prevState.components, ...playgrounds.map(({ components })=> (components)).flat()].map((component, i, arr)=> ((arr.find(({ id }, ii)=> (i === ii))) ? component : null)).sort((i, ii)=> ((i.id < ii.id) ? -1 : (i > ii) ? 1 : 0));
      
      console.log('!!!!!!!!!!!!!!!', { components });
      

      const comments = [ ...prevState.comments, ...playgrounds.map(({ components })=> (components)).flat().map(({ comments })=> (comments)).flat()];//loop thru parent and merge merge the dups (InviteForm) -->  .map((comment, i, flatComments)=> ((component.id === )))
      const playground = playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)) || playgrounds.pop();
      const typeGroup = (playground) ? playground.typeGroups.find(({ key })=> (key === (params.typeGroupSlug || 'views'))) || null : null;
      const component = (playground) ? playground.components.find(({ id })=> (id === params.componentID)) || null : null;
      const comment = (component) ? component.comments.find(({ id })=> (id === params.commentID)) || null : null;


      payload.playgrounds = playgrounds.sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));
      payload.components = components;
      payload.comments = comments;
      payload.playground = playground;
      payload.typeGroup = typeGroup;
      payload.component = component;
      payload.comment = comment;

      // playgrounds.forEach(({ buildID })=> {
      //   dispatch(fetchBuildPlaygrounds({ buildID }));
      // });

      playgrounds.filter(({ buildID })=> (buildID !== params.buildID)).forEach(({ buildID })=> {
        dispatch(fetchBuildPlaygrounds({ buildID }));
      });

    } else if (type === TEAM_COMMENTS_LOADED) {
      const { team } = prevState;      
      const comments = payload.comments.map((comment, i)=> (reformComment(comment, `${Pages.ASK}/${team.slug}/ask`)));

      payload.team = (team) ? { ...team, comments } : null;
      payload.comments = [ ...new Set([ ...prevState.comments, ...comments])];

    } else if (type === BUILD_PLAYGROUNDS_LOADED) {
      const { devices, componentTypes, team, matchPath } = prevState;
      const { params } = matchPath || {};

      const playgrounds = [ ...new Set([ ...prevState.playgrounds, ...payload.playgrounds.map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team))).map((playground)=> ({ ...playground, selected : (playground.buildID === params.buildID)})).filter(({ id })=> (!prevState.playgrounds.map(({ id })=> (id)).includes(id)))])];
      const comments = [ ...new Set([ ...prevState.comments, ...playgrounds.map(({ components })=> (components)).flat().map(({ comments })=> (comments)).flat()])];
      // const playground = (params.projectSlug !== 'ask') ? playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)) || (prevState.playground || [ ...playgrounds].shift()) : null;
      const playground = (params.projectSlug !== 'ask') ? playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)) || null : null;
      const typeGroup = (playground) ? (playground.typeGroups.find(({ key })=> (key === params.typeGroupSlug)) || playground.typeGroups.find(({ key })=> (key === 'views'))) : null;
      const component = (playground) ? playground.components.find(({ id })=> (id === params.componentID)) || null : null;
      const comment = (component) ? component.comments.find(({ id })=> (id === params.commentID)) || null : null;


      dispatch(updateMatchPath({ 
        matchPath : { ...matchPath,
          params : { ...params,
            teamSlug      : (params.teamSlug !== team.slug) ? team.slug : params.teamSlug,
            projectSlug   : (playground && params.projectSlug !== playground.projectSlug) ? playground.projectSlug : params.projectSlug,
            buildID       : (playground && params.buildID !== playground.buildID) ? playground.buildID : params.buildID,
            deviceSlug    : (playground && params.deviceSlug !== playground.device.slug) ? playground.device.slug : params.deviceSlug,
            typeGroupSlug : (typeGroup && params.typeGroupSlug !== typeGroup.key) ? typeGroup.key : params.typeGroupSlug,
            componentID   : (params.componentID && !component) ? null : params.componentID,
            comments      : (params.componentID && component && params.comments),
            commentID     : (params.commentID && !comment) ? null : params.commentID
          }
        }
      }));

      payload.playgrounds = playgrounds.sort((i, ii)=> ((i.id < ii.id) ? 1 : (i.id > ii.id) ? -1 : 0));
      payload.comments = comments;
      payload.playground = playground;
      payload.typeGroup = typeGroup;
      payload.component = component;
      payload.comment = comment;
    
    } else if (type === UPDATE_MATCH_PATH) {
      if (payload.matchPath.params) {
        const params = { ...payload.matchPath.params,
          teamSlug      : (payload.matchPath.params.teamSlug || null),
          projectSlug   : (payload.matchPath.params.projectSlug || null),
          buildID       : (payload.matchPath.params.buildID) ? payload.matchPath.params.buildID << 0 : null,
          deviceSlug    : (payload.matchPath.params.deviceSlug || null),
          typeGroupSlug : (payload.matchPath.params.typeGroupSlug || null),
          componentID   : (payload.matchPath.params.componentID) ? payload.matchPath.params.componentID << 0 : null,
          ax            : false,
          // ax            : (typeof payload.matchPath.params.ax !== 'undefined' && payload.matchPath.params.ax !== null && payload.matchPath.params.ax === 'accessibility'),
          comments      : (payload.matchPath.params.comments === true || (typeof payload.matchPath.params.comments !== 'undefined' && payload.matchPath.params.comments !== null && payload.matchPath.params.comments === 'comments')),
          commentID     : (payload.matchPath.params.commentID) ? payload.matchPath.params.commentID << 0 : null,
        };

        delete (params['0']);
        delete (params['1']);
        payload.matchPath = { ...payload.matchPath, params };

        // console.log('!!!!!!!!!!!!!!!', { prevState, params });
      }

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

    } else if (type === COMMENT_VOTED) {
      const { team, playgrounds, playground, typeGroup, component } = prevState;

      let { comment } = payload
      if (comment.type === 'team') {
        comment = reformComment(comment, `${Pages.ASK}/${team.slug}/ask/comments`);

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

          // console.log('!!!!!!!!!!!!!!!', { components, comm });

        
        } else {
          componentID = component.id;
        }


        // const comments = [ ...prevState.comments, ...playgrounds.map(({ components })=> (components)).flat().map(({ comments })=> (comments)).flat()];//loop thru parent and merge merge the dups (InviteForm) -->  .map((comment, i, flatComments)=> ((component.id === )))

        if (playground) {
          projectSlug = playground.projectSlug;
          buildID = playground.buildID;
          deviceSlug = playground.device.slug;
        
        } else {
          //componentID = playgrounds.
        }

        if (typeGroup) {
          typeGroupSlug = typeGroup.slug;
        }

        


        // console.log('!!!!!!!!!!!!!!!', { playground, params });

        comment = reformComment(comment, `${Pages.PLAYGROUND}/${team.slug}/${playground.projectSlug}/${playground.buildID}/${playground.device.slug}}/${typeGroup.slug}/${component.id}/comments`);
      }

      

      // const matchURI = (payload.comment.type === 'component') ? matchPath(comment.uri, {
      //   path   : `${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:deviceSlug([a-z0-9-]+)?/:typeGroupSlug([a-z-]+)?/:componentID([0-9]+)?/:ax(accessibility)?/:comments(comments)?/:commentID([0-9]+)?`,
      //   exact  : false,
      //   strict : false
      // }) : matchPath(comment.uri, {
      //   path   : `${Pages.ASK}/:teamSlug([a-z-]+)?/ask/(comments)?/:commentID([0-9]+)?`,
      //   exact  : false,
      //   strict : false
      // });

      payload.comment = comment;
      

      // if (payload.comment.type === "team") {
      //   const { team } = prevState;

      //   // const comments = team.comments.map((comment)=> ((comment.id === payload.comment.id) ? reformComment(payload.comment, team) : comment));
      //   // payload.team = { ...team, comments };

      //   payload.team = { ...team, 
      //     comments : team.comments.map((comment)=> ((comment.id === payload.comment.id) ? payload.comment : comment))
      //   }

      //   delete (payload['comment']);
      
      // } else if (payload.comment.type === 'component') {
      //     const { playgrounds } = prevState;
      //     payload.playgrounds = playgrounds.map((playground)=> ((playground)))
      // }
    
    } else if (type === SET_PLAYGROUND) {
      const { playground } = payload;
      const { devices, matchPath } = prevState;

      if (matchPath) {
        const { params } = matchPath;

        const device = (playground) ? devices.find(({ id })=> (id === playground.deviceID)) || null : null;
        const typeGroup = (playground) ? playground.typeGroups.find(({ key })=> (key === (params.typeGroupSlug || 'views'))) || null : null;
        
        dispatch(updateMatchPath({ 
          matchPath : { ...matchPath,
            params : { ...params,
              projectSlug   : (playground) ? playground.projectSlug : params.projectSlug,
              buildID       : (playground) ? playground.buildID : params.buildID,
              deviceSlug    : (device) ? device.slug : params.deviceSlug,
              typeGroupSlug : (typeGroup) ? typeGroup.key : params.typeGroupSlug
            }
          }
        }));

        dispatch(setTypeGroup(typeGroup));
      
      } else {
        dispatch(setTypeGroup(null));
      }

    } else if (type === SET_TYPE_GROUP) {
      const { typeGroup } = payload;
      const { component, matchPath } = prevState;

      if (matchPath) {
        const { params } = matchPath;

        dispatch(updateMatchPath({ 
          matchPath : { ...matchPath,
            params : { ...params,
              typeGroupSlug : (typeGroup) ? typeGroup.key : null
            }
          }
        }));
        
        if (component || params.componentID) {
          dispatch(setComponent(null));
        }

      } else {
        dispatch(setComponent(null));
      }

    } else if (type === SET_COMPONENT) {
      const { component } = payload;
      const { comment, matchPath } = prevState;
      
      if (matchPath) {  
        const { params } = matchPath;

        dispatch(updateMatchPath({ 
          matchPath : { ...matchPath,
            params : { ...params,
              componentID : (component) ? component.id : null,
              comments    : false//(component !== null || (component && params.componentID === component.id))
            }
          }
        }));

        if ((!component && comment) || (component && params.componentID !== component.id)) {
          dispatch(setComment(null));
        }

      } else {
        dispatch(setComment(null));
      }

    } else if (type === SET_COMMENT) {
      const { comment } = payload;
      const { matchPath } = prevState;

      if (matchPath) {  
        const { params } = matchPath;

        dispatch(updateMatchPath({ 
          matchPath : { ...matchPath,
            params : { ...params,
              // comments  : (params.componentID && params.comments) ? 'comments' : params.comments,
              comments  : (params.componentID && comment) ? 'comments' : params.comments,
              commentID : (comment) ? comment.id : null
            }
          }
        }));
      }
    }

    next(action);

    const postState = store.getState();
    logFormat({ store : postState, action, next, meta : 'POST [==>' });
  });
}
