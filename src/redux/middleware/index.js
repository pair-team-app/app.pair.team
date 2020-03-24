
import moment from 'moment';
import cookie from 'react-cookies';
import { reformComponent, reformPlayground , reformComment} from '../../components/pages/PlaygroundPage/utils/reform';
import { DEVICES_LOADED,
  BUILD_PLAYGROUNDS_LOADED, TEAM_LOADED, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, 
  TYPE_GROUP_LOADED, 
  USER_PROFILE_UPDATED, 
  USER_PROFILE_LOADED, 
  UPDATE_MATCH_PATH,
  UPDATE_MOUSE_COORDS,
  SET_PLAYGROUND, SET_TYPE_GROUP, SET_COMPONENT, SET_COMMENT,
  TOGGLE_AX, TOGGLE_COMMENTS, TOGGLE_THEME
} from '../../consts/action-types';
import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';
import { fetchTeamBuilds, fetchTeamComments, fetchPlaygroundComponentGroup, fetchTeamLookup, fetchBuildPlaygrounds, updateMatchPath, setComment, setComponent, setTypeGroup, setPlayground } from '../actions';
import {typeGroupByID} from '../../components/pages/PlaygroundPage/utils/lookup';


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
    // console.log('onMiddleware()', { prevState, type, payload });
    logFormat({ prevState, action, next });

    if (type === DEVICES_LOADED) {

    } else if (type === USER_PROFILE_LOADED || type === USER_PROFILE_UPDATED) {
      const { userProfile } = payload;
      if (userProfile) {
        dispatch(fetchTeamLookup({ userProfile }));
      }

    } else if (type === TEAM_LOADED) {
      dispatch(fetchTeamBuilds({ team : payload.team }));

      const { team } = prevState;
      const comments = (payload.team.comments) ? payload.team.comments.map((comment, i)=> (reformComment(comment, false, team))) : [];
      payload.team.comments = comments;

    } else if (type === TYPE_GROUP_LOADED) {
      const { componentTypes, playground } = prevState;
      // let { components } = payload;

      // const components = [ ...new Set([ ...playground.components, ...Object.values((components).map((component)=> (reformComponent(component, componentTypes)))) ])];
      const components = [ ...new Set([ ...playground.components, ...payload.components.map((component)=> (reformComponent(component, componentTypes))) ])];

      playground.components = [ ...components ];
      payload.playgrounds = prevState.playgrounds.map((item)=> ((item.id === playground.id) ? playground : item));
      payload.playground = playground;
      
    } else if (type === USER_PROFILE_UPDATED) {
      cookie.save('user_id', (payload) ? payload.id : '0', { path : '/', sameSite : false });

    } else if (type === TEAM_BUILDS_LOADED) {
      const { devices, componentTypes, team, matchPath } = prevState;
      const { params } = matchPath || {};

      const playgrounds = payload.playgrounds.map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team))).map((playground)=> ({ ...playground, selected : (playground.buildID === params.buildID)}));
      const playground = playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)) || null;
      const typeGroup = (playground) ? playground.typeGroups.find(({ key })=> (key === (params.typeGroupSlug || 'views'))) : null;
      const component = (playground) ? playground.components.find(({ id })=> (id === params.componentID)) || null : null;
      const comment = (component) ? component.comments.find(({ id })=> (id === params.commentID)) || null : null;

      payload.playgrounds = playgrounds;
      payload.playground = playground;
      payload.typeGroup = typeGroup;
      payload.component = component;
      payload.comment = comment;

      dispatch(fetchBuildPlaygrounds({ buildID : params.buildID }));
      dispatch(fetchTeamComments({ team : prevState.team }));

    } else if (type === TEAM_COMMENTS_LOADED) {
      const { team } = prevState;
      const comments = payload.comments.map((comment, i)=> (reformComment(comment, false, team)));
      payload.team = (team) ? { ...team, comments } : null;

    } else if (type === BUILD_PLAYGROUNDS_LOADED) {
      const { devices, componentTypes, team, matchPath } = prevState;
      const { params } = matchPath || {};

      const playgrounds = [ ...new Set([ ...prevState.playgrounds, ...payload.playgrounds.map((playground, i)=> (reformPlayground(playground, devices, componentTypes, team))).map((playground)=> ({ ...playground, selected : (playground.buildID === params.buildID)})).filter(({ id })=> (!prevState.playgrounds.map(({ id })=> (id)).includes(id)))])];
      const playground = playgrounds.find(({ buildID, device })=> (buildID === params.buildID && device.slug === params.deviceSlug)) || prevState.playground;
      const typeGroup = (playground) ? playground.typeGroups.find(({ key })=> (key === (params.typeGroupSlug || 'views'))) : null;
      const component = (playground) ? playground.components.find(({ id })=> (id === params.componentID)) || null : null;
      const comment = (component) ? component.comments.find(({ id })=> (id === params.commentID)) || null : null;

      payload.playgrounds = playgrounds;
      payload.playground = playground;
      payload.typeGroup = typeGroup;
      payload.component = component;
      payload.comment = comment;

      // payload.playgrounds = prevState.playgrounds.map((playground)=> {
      //   const pg = payload.playgrounds.map((playground)=> (reformPlayground(playground, true, team, componentTypes))).find(({ id })=> ((id === playground.id)));
      //   return ((pg) ? Object.assign({}, playground, pg) : playground);
      // });

      // const playground = (prevState.playground && playgrounds.find(({ id })=> (id === prevState.playrgound.id))) ? playgrounds.find(({ id })=> (id === prevState.playground.id)) : prevState.playground;

      // payload.playgrounds = playgrounds;
      // payload.playground = playground;

      /*
      const { componentTypes, team, matchPath } = prevState;
      // const { params } = (matchPath || {});

      const playgrounds = prevState.playgrounds.map((playground)=> {
        let pg = payload.playgrounds.map((playground)=> (reformPlayground(playground, true, team, componentTypes))).find(({ id })=> ((id === playground.id)));
        let merge = (pg) ? Object.assign({}, playground, pg) : playground;
        
        return ({ ...merge,
          components : [ ...new Set(merge.components)]
        });
      });

      const playground = (playgrounds.find(({ id })=> (id === prevState.playrgound.id))) ? playgrounds.find(({ id })=> (id === prevState.playground.id)) : prevState.playground;
      // const component = (playground) ? playground.components.find(({ id, typeID })=> (params.componentID && id == params.componentID)) : prevState.component;
      // const component = prevState.component;

      // console.log ('!!!!!!!!!!!!!', { params, playgrounds, playground, component });
      console.log ('!!!!!!!!!!!!!', { matchPath, playgrounds, playground });

      payload.playgrounds = playgrounds;
      payload.playground = playground;
      // payload.component = component;

      // dispatch(fetchPlaygroundComponentGroup({ 
      //   playground : { id : prevState.playground.id }, 
      //   typeGroup : { id : 187 } 
      // }));
      */
    
    } else if (type === UPDATE_MATCH_PATH) {
      if (payload.matchPath.params) {
        const params = { ...payload.matchPath.params,
          teamSlug      : (payload.matchPath.params.teamSlug || null),
          projectSlug   : (payload.matchPath.params.projectSlug || null),
          buildID       : payload.matchPath.params.buildID << 0,
          deviceSlug    : (payload.matchPath.params.deviceSlug || null),
          typeGroupSlug : (payload.matchPath.params.typeGroupSlug || null),
          componentID   : (payload.matchPath.params.componentID) ? payload.matchPath.params.componentID << 0 : null,
          // ax            : (typeof payload.matchPath.params.ax !== 'undefined' && payload.matchPath.params.ax !== null && payload.matchPath.params.ax === 'accessibility'),
          comments      : (payload.matchPath.params.comments === true || (typeof payload.matchPath.params.comments !== 'undefined' && payload.matchPath.params.comments !== null && payload.matchPath.params.comments === 'comments')),
          commentID     : (payload.matchPath.params.commentID) ? payload.matchPath.params.commentID << 0 : null,
        };

        delete (params['0']);
        delete (params['1']);
        payload.matchPath = { ...payload.matchPath, params };


        // console.log('!!!!!!!!!!!!!!!', { prevState, params });

        // if (prevState.matchPath.params !== params) {
          // if (!prevState.component && prevState.matchPath && prevState.matchPath.params.componentID !== params.componentID) {
          //   dispatch(setComponent(prevState.playground.components.find(({ id })=> (id === params.componentID))));
          // }
        // }
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
    
    } else if (type === SET_PLAYGROUND) {
      const { playground } = payload;

      const { devices, matchPath } = prevState;
      const { params } = matchPath;

      const device = devices.find(({ id })=> (id === playground.deviceID)) || null;
      
      dispatch(updateMatchPath({ 
        matchPath : { ...matchPath,
          params : { ...params,
            buildID       : playground.buildID,
            deviceSlug    : (device) ? device.slug : null,
            typeGroupSlug : 'views'
          }
        }
      }));

    } else if (type === SET_TYPE_GROUP) {
      const { typeGroup } = payload;

      const { component, matchPath } = prevState;
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

    } else if (type === SET_COMPONENT) {
      const { component } = payload;

      const { comment, matchPath } = prevState;
      const { params } = matchPath;

      if ((!component && comment) || (component && params.componentID !== component.id)) {
        dispatch(setComment(null));
      }

      dispatch(updateMatchPath({ 
        matchPath : { ...matchPath,
          params : { ...params,
            componentID : (component) ? component.id : null,
            comments    : false//(component !== null || (component && params.componentID === component.id))
          }
        }
      }));

    } else if (type === SET_COMMENT) {
      const { comment } = payload;

      const { component, matchPath } = prevState;
      const { params } = matchPath;

      dispatch(updateMatchPath({ 
        matchPath : { ...matchPath,
          params : { ...params,
            comments  : (params.componentID && (params.comments || comment)) ? 'comments' : params.comments,
            commentID : (comment) ? comment.id : null
          }
        }
      }));
    }

    next(action);

    const postState = store.getState();
    logFormat({ store : postState, action, next, meta : 'POST [==>' });
  });
}
