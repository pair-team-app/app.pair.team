
import cookie from 'react-cookies';

import {
  SET_REFORMED_TYPE_GROUP,
  USER_PROFILE_CACHED,
  USER_PROFILE_UPDATED,
  TYPE_GROUP_LOADED, UPDATE_MOUSE_COORDS, SET_PLAYGROUND,
} from '../../consts/action-types';
import { reformComponent } from '../../components/pages/PlaygroundPage/utils/reform';

import { LOG_MIDDLEWARE_PREFIX } from '../../consts/log-ascii';


const logFormat = (action, meta='')=> {
	if (typeof action !== 'function') {
		const { type, payload } = action;
		if (type !== UPDATE_MOUSE_COORDS) {
      console.log(LOG_MIDDLEWARE_PREFIX, `MW >> “${type}”`, action, payload, meta);
    }
	}
};


export function onMiddleware({ dispatch }) {
	return ((next)=> {
		return (async (action)=> {
			logFormat(action);

			const { type, payload } = action;
			if (type === TYPE_GROUP_LOADED) {
				let { playground, components } = payload;

        components = (await Promise.all(Object.values(components).map(async(component)=> {
          console.log('PLAYGROUND_TYPE_GROUP_COMPONENTS', 'PRE', { id : component.id, typeID : component.type_id, title : component.title });
          return (await reformComponent(component));
        })));

        playground.components = playground.components.map((comp)=> ((components.find(({ id })=> ((id === comp.id))) || comp)));
        console.log('PLAYGROUND_TYPE_GROUP_COMPONENTS', 'POST', playground.components);

        dispatch({
          type    : SET_REFORMED_TYPE_GROUP,
          payload : components
        });

      } else if (type === USER_PROFILE_CACHED) {
			} else if (type === USER_PROFILE_UPDATED) {
				cookie.save('user_id', (payload) ? payload.id : '0', { path : '/', sameSite : false });

// 			} else if (type === UPDATE_DEEPLINK) {
// 				const deeplink = Object.assign({}, payload, {
// 					uploadID   : (payload && payload.uploadID) ? (payload.uploadID << 0) : 0,
// 					pageID     : (payload && payload.pageID) ? (payload.pageID << 0) : 0,
// 					artboardID : (payload && payload.artboardID) ? (payload.artboardID << 0) : 0,
// 					sliceID    : (payload && payload.sliceID) ? (payload.sliceID << 0) : 0
// 				});
//
// 				dispatch({
// 					type    : CONVERTED_DEEPLINK,
// 					payload : deeplink
// 				});

// 			} else if (type === SET_TEAMS) {
			} else if (type === SET_PLAYGROUND) {

      }

			return (next(action));
		})
	});
}
