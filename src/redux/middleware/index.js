
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
import { fetchTeamBuilds, fetchTeamComments, fetchPlaygroundComponentGroup, fetchTeamLookup } from '../actions';


const logFormat = ({ store, action, next, meta = '' })=> {
  if (typeof action !== 'function') {
    const { type, payload } = action;

    if (type !== UPDATE_MOUSE_COORDS) {
      // 
      
    }
  }
};


export function onMiddleware(store) {
  return ((next)=> async(action)=> {
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
      const comments = (payload.team.comments) ? await Promise.all(payload.team.comments.map(async (comment, i)=> (await reformComment(comment, false, team)))) : [];
      payload.team.comments = comments;

    } else if (type === TYPE_GROUP_LOADED) {
      let { playground } = prevState;
      let { components } = payload;


      components = await Promise.all(
        Object.values((components).map(async (component)=> {
          return await reformComponent(component);
        })
      ));

      

      playground.components = [ ...playground.components, ...components ];
      // playground.components = [ ...components ];
      playground.components = playground.components.map(
        (comp)=> components.find(({ id })=> id === comp.id) || comp
      );
      

    } else if (type === USER_PROFILE_UPDATED) {
      cookie.save('user_id', (payload) ? payload.id : '0', { path : '/', sameSite : false });

    } else if (type === TEAM_BUILDS_LOADED) {
      dispatch(fetchTeamComments({ team : prevState.team }));

      const { team } = prevState;
      const playgrounds = await Promise.all(payload.playgrounds.map(async (playground, i)=> (await reformPlayground(playground, false, team))));
      payload.playgrounds = playgrounds;

    } else if (type === TEAM_COMMENTS_LOADED) {
      const { team } = prevState;
      const comments = await Promise.all(payload.comments.map(async (comment, i)=> (await reformComment(comment, false, team))));
      payload.team = (team) ? { ...team, comments } : null;

    } else if (type === BUILD_PLAYGROUNDS_LOADED) {
      const { team } = prevState;
      const { playgroundID } = payload;

      const playgrounds = await Promise.all(payload.playgrounds.map(async (playground)=> (await reformPlayground(playground, true, team))));
      payload.playgrounds = playgrounds;

      dispatch(fetchPlaygroundComponentGroup({ 
        playground : { id : playgroundID }, 
        typeGroup : { id : 187 } 
      }));
    
    } else if (type === UPDATE_MATCH_PATH) {
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

    next(action);

    const postState = store.getState();
    logFormat({ store : postState, action, next, meta : 'POST [==>' });
  });
}
