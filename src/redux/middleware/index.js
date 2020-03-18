
import moment from 'moment';
import cookie from 'react-cookies';
import { reformComponent, reformPlayground , reformComment} from '../../components/pages/PlaygroundPage/utils/reform';
import { DEVICES_LOADED,
  BUILD_PLAYGROUNDS_LOADED, TEAM_LOADED, TEAM_BUILDS_LOADED, TEAM_COMMENTS_LOADED, 
  TYPE_GROUP_LOADED, UPDATE_MOUSE_COORDS, 
  USER_PROFILE_UPDATED, 
  USER_PROFILE_LOADED, 
  UPDATE_MATCH_PATH } from '../../consts/action-types';
import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';
import { fetchTeamBuilds, fetchTeamComments, fetchPlaygroundComponentGroup, fetchTeamLookup, lookupTypeGroup, fetchBuildPlaygrounds } from '../actions';


const logFormat = ({ store, action, next, meta = '' })=> {
  if (typeof action !== 'function') {
    const { type, payload } = action;

    if (type !== UPDATE_MOUSE_COORDS) {
      // 
      
    }
  }
};


export function onMiddleware(store) {
  return ((next)=> (action)=> {
    const prevState = store.getState();
    const { dispatch } = store;

    const { type, payload } = action;
    logFormat({ store : prevState, action, next, meta : '<==] PREV' });

    if (type === DEVICES_LOADED) {

    } else if (type === USER_PROFILE_LOADED || type === USER_PROFILE_UPDATED) {
      if (payload) {
        dispatch(fetchTeamLookup({ userID : payload.id }));
      }

    } else if (type === TEAM_LOADED) {
      dispatch(fetchTeamBuilds({ team : payload.team }));

      const { team } = prevState;
      const comments = (payload.team.comments) ? payload.team.comments.map((comment, i)=> (reformComment(comment, false, team))) : [];
      payload.team.comments = comments;

    } else if (type === TYPE_GROUP_LOADED) {
      let { componentTypes, playground } = prevState;
      // let { components } = payload;

      // const components = [ ...new Set([ ...playground.components, ...Object.values((components).map((component)=> (reformComponent(component, componentTypes)))) ])];
      const components = [ ...new Set([ ...playground.components, ...payload.components.map((component)=> (reformComponent(component, componentTypes))) ])];

      playground.components = [ ...components ];
      payload.playgrounds = prevState.playgrounds.map((item)=> ((item.id === playground.id) ? playground : item));
      payload.playground = playground;
      
    } else if (type === USER_PROFILE_UPDATED) {
      cookie.save('user_id', (payload) ? payload.id : '0', { path : '/', sameSite : false });

    } else if (type === TEAM_BUILDS_LOADED) {
      const { componentTypes, team } = prevState;
      const playgrounds = payload.playgrounds.map((playground, i)=> (reformPlayground(playground, false, team, componentTypes)));
      const playground = playgrounds.find(({ deviceID })=> (deviceID === 2));
      const typeGroup = playground.typeGroups.find(({ id })=> (id === 187 ));

      payload.playgrounds = playgrounds;
      payload.playground = playground;
      payload.typeGroup = typeGroup;

      dispatch(fetchBuildPlaygrounds({ buildID : playground.buildID }));
      dispatch(fetchTeamComments({ team : prevState.team }));

    } else if (type === TEAM_COMMENTS_LOADED) {
      const { team, playground } = prevState;
      const comments = payload.comments.map((comment, i)=> (reformComment(comment, false, team)));
      payload.team = (team) ? { ...team, comments } : null;

    } else if (type === BUILD_PLAYGROUNDS_LOADED) {
      const { componentTypes, team } = prevState;

      const playgrounds = prevState.playgrounds.map((playground)=> {
        let pg = payload.playgrounds.map((playground)=> (reformPlayground(playground, true, team, componentTypes))).find(({ id })=> ((id === playground.id)));
        // return ((pg) ? Object.assign({}, playground, pg) : playground);
        let merge = (pg) ? Object.assign({}, playground, pg) : playground;
        
        return ({ ...merge,
          components : [ ...new Set(merge.components)]
        });
      });

      const playground = (prevState.playground && playgrounds.find(({ id })=> (id === prevState.playrgound.id))) ? playgrounds.find(({ id })=> (id === prevState.playground.id)) : prevState.playground;

      payload.playgrounds = playgrounds;
      payload.playground = playground;

      dispatch(fetchPlaygroundComponentGroup({ 
        playground : { id : prevState.playground.id }, 
        typeGroup : { id : 187 } 
      }));
    
    } else if (type === UPDATE_MATCH_PATH) {
      if (payload.matchPath.params) {
const params = { ...payload.matchPath.params,
        teamSlug       : (payload.matchPath.params.teamSlug || null),
        projectSlug    : (payload.matchPath.params.projectSlug || null),
        buildID        : payload.matchPath.params.buildID << 0,
        deviceSlug     : (payload.matchPath.params.deviceSlug || null),
        typeGroupSlug  : (payload.matchPath.params.typeGroupSlug || null),
        componentID    : (payload.matchPath.params.componentID) ? payload.matchPath.params.componentID << 0 : null,
        ax             : (typeof payload.matchPath.params.ax !== 'undefined'),
        comments       : (typeof payload.matchPath.params.comments !== 'undefined'),
        commentID      : (payload.matchPath.params.commentID) ? payload.matchPath.params.commentID << 0 : null,
      };

      delete (params['0']);
      delete (params['1']);
      payload.matchPath = { ...payload.matchPath, params };
      }
    }

    next(action);

    const postState = store.getState();
    logFormat({ store : postState, action, next, meta : 'POST [==>' });
  });
}
