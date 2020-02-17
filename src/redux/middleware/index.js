
import moment from 'moment';
import cookie from 'react-cookies';
import { reformComponent, reformPlayground } from '../../components/pages/PlaygroundPage/utils/reform';
import { BUILD_PLAYGROUNDS_LOADED, TEAM_LOADED, TEAM_BUILDS_LOADED, 
  TYPE_GROUP_LOADED, UPDATE_MOUSE_COORDS, 
  USER_PROFILE_UPDATED, 
  USER_PROFILE_LOADED } from '../../consts/action-types';
import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';
import { fetchTeamBuilds, fetchPlaygroundComponentGroup, fetchTeamLookup } from '../actions';

const logFormat = ({ store, action, next, meta = "" }) => {
  if (typeof action !== 'function') {
    const { type, payload } = action;

    if (type !== UPDATE_MOUSE_COORDS) {
      console.log(
        LOG_MIDDLEWARE_PREFIX,
        `PRE STORE:${store}`, '\n',
        `MW >> “${type}”`,
        { action, payload, next, meta }
      );
    }
  }
};

export function onMiddleware(store) {
  const { dispatch } = store;
  const storeState = store.getState();

  return next => {
    return async action => {
      logFormat({ store : JSON.stringify(storeState, null, 2), action, next });
      // console.log('<>()<>', storeState);

      const { type, payload } = action;
      if (type === USER_PROFILE_LOADED || type === USER_PROFILE_UPDATED) {

        if (payload) {
          dispatch(fetchTeamLookup({ userID : payload.id }));
        }

      } else if (type === TEAM_LOADED) {
         dispatch(fetchTeamBuilds({ team : payload }));

      } else if (type === TYPE_GROUP_LOADED) {
        let { playground, components } = payload;

        components = await Promise.allSettled(
          Object.values(components).map(async component => {
            return await reformComponent(component);
          })
        );

        playground.components = { ...playground.components, components };
        // playground.components = playground.components.map(
        //   comp => components.find(({ id }) => id === comp.id) || comp
        // );
        // //         console.log('TYPE_GROUP_LOADED', 'POST', playground.components.map(({ id, typeID, title, html, styles, rootStyles, image_data, processed })=> ({ id, typeID, title, html, styles, rootStyles, image_data, processed })));



        // dispatch(fetchPlaygroundComponentGroup({ 
        //   playground : { id : playgroundID }, 
        //   typeGroup : { id : 187 } 
        // }));


      } else if (type === USER_PROFILE_UPDATED) {
        cookie.save('user_id', payload ? payload.id : '0', {
          path: '/',
          sameSite: false
        });

      } else if (type === TEAM_BUILDS_LOADED) {
        const { team } = payload;
        const playgrounds = await Promise.all(payload.playgrounds.map(async (playground, i) => (await reformPlayground(playground, team))));
        payload.playgrounds = playgrounds;

      } else if (type === BUILD_PLAYGROUNDS_LOADED) {
        const { playgroundID } = payload;

        const playgrounds = await Promise.all(payload.playgrounds.map(async playground => (await reformPlayground(playground, false))));
        payload.playgrounds = playgrounds;

        dispatch(fetchPlaygroundComponentGroup({ 
          playground : { id : playgroundID }, 
          typeGroup : { id : 187 } 
        }));
      }

      return next(action);
    };
  };
}
