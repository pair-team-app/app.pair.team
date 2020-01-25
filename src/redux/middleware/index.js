
import cookie from 'react-cookies';

import {
  SET_REFORMED_BUILD_PLAYGROUNDS,
  SET_REFORMED_TYPE_GROUP,
  USER_PROFILE_CACHED,
  USER_PROFILE_UPDATED,
  BUILD_PLAYGROUNDS_LOADED,
  TYPE_GROUP_LOADED,
  UPDATE_MOUSE_COORDS,
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
          const { id, type_id : typeID, title, html, styles, root_styles : rootStyles, processed } = component;
//           console.log('TYPE_GROUP_LOADED', 'PRE', component, { id, typeID, title, html, styles, rootStyles, processed });
          return (await reformComponent(component));
//           return (await reformComponent({ ...component, root_styles : rootStyles }));
        })));

        playground.components = playground.components.map((comp)=> ((components.find(({ id })=> ((id === comp.id))) || comp)));
//         console.log('TYPE_GROUP_LOADED', 'POST', playground.components.map(({ id, typeID, title, html, styles, rootStyles, image_data, processed })=> ({ id, typeID, title, html, styles, rootStyles, image_data, processed })));

        dispatch({
          type    : SET_REFORMED_TYPE_GROUP,
          payload : { playground, components }
        });

			} else if (type === USER_PROFILE_UPDATED) {
				cookie.save('user_id', (payload) ? payload.id : '0', { path : '/', sameSite : false });

			} else if (type === BUILD_PLAYGROUNDS_LOADED) {
			  const { playgroundID } = payload;

        const playgrounds = await Promise.all(payload.playgrounds.map(async(playground)=> {
          const { device_id, team, components } = playground;
          delete (playground['device_id']);

          const { logo_url } = team;
          delete (team['logo_url']);

//					console.log('playground', { id : playground.id, device_id, components });
          return ({ ...playground,
            deviceID   : device_id,
            team       : { ...team,
              logoURL : logo_url,
              members : team.members.map((member)=> ({ ...member,
                id : member.id << 0
              }))
            },
            components : await Promise.all(components.map(async(component)=> (await reformComponent(component))))
          });
        }));

        dispatch({
          type    : SET_REFORMED_BUILD_PLAYGROUNDS,
          payload : { playgrounds, playgroundID }
        });

      } else if (type === USER_PROFILE_CACHED) {
      }

			return (next(action));
		})
	});
}
