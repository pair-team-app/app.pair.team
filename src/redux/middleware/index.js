import cookie from "react-cookies";
import { reformComponent } from "../../components/pages/PlaygroundPage/utils/reform";
import { BUILD_PLAYGROUNDS_LOADED, SET_REFORMED_BUILD_PLAYGROUNDS, SET_REFORMED_TEAM_PLAYGROUNDS_SUMMARY, SET_REFORMED_TYPE_GROUP, TEAM_PLAYGROUNDS_SUMMARY_LOADED, TYPE_GROUP_LOADED, UPDATE_MOUSE_COORDS, USER_PROFILE_CACHED, USER_PROFILE_UPDATED } from "../../consts/action-types";
import { LOG_MIDDLEWARE_PREFIX } from "../../consts/log-ascii";
import { fetchPlaygroundComponentGroup } from "../actions";

const logFormat = (action, meta = "") => {
  if (typeof action !== "function") {
    const { type, payload } = action;
    if (type !== UPDATE_MOUSE_COORDS) {
      console.log(
        LOG_MIDDLEWARE_PREFIX,
        `MW >> “${type}”`,
        { action, payload, meta }
      );
    }
  }
};

export function onMiddleware({ dispatch }) {
  return next => {
    return async action => {
      logFormat(action);

      const { type, payload } = action;
      if (type === TYPE_GROUP_LOADED) {
        let { playground, components } = payload;

        components = await Promise.all(
          Object.values(components).map(async component => {
            const {
              id,
              type_id: typeID,
              title,
              html,
              styles,
              root_styles: rootStyles,
              processed
            } = component;
            //           console.log('TYPE_GROUP_LOADED', 'PRE', component, { id, typeID, title, html, styles, rootStyles, processed });
            return await reformComponent(component);
            //           return (await reformComponent({ ...component, root_styles : rootStyles }));
          })
        );

        playground.components = { ...playground.components, components };


        // playground.components = playground.components.map(
        //   comp => components.find(({ id }) => id === comp.id) || comp
        // );
        // //         console.log('TYPE_GROUP_LOADED', 'POST', playground.components.map(({ id, typeID, title, html, styles, rootStyles, image_data, processed })=> ({ id, typeID, title, html, styles, rootStyles, image_data, processed })));

        dispatch({
          type: SET_REFORMED_TYPE_GROUP,
          payload: { playground, components }
        });


      } else if (type === USER_PROFILE_UPDATED) {
        cookie.save("user_id", payload ? payload.id : "0", {
          path: "/",
          sameSite: false
        });

      } else if (type === TEAM_PLAYGROUNDS_SUMMARY_LOADED) {
        const { team } = payload;
        const playgrounds = await Promise.all(
          payload.playgrounds.map(async (playground, i) => {
            const { device_id, components } = playground;
            delete playground["device_id"];
            const deviceID = device_id;

            return i === 0 && deviceID === 1
              ? {
                  ...playground,
                  team,
                  deviceID: device_id,
                  components: (await Promise.all(
                    components//[:][:][:][:][:][:][:][:][:][:]
                      .map(async component => {
                        // console.log((component.type_id === 187) ? '[[>[>[>[>[>[>[>[>[>[>[>[>[>[>' : '[-][-][-][-][-][-][-][-][-][-]', {
                          // ...component
                        // });

                        // if (component.type_id === 187) {
                          // console.log('[[>[>[>[>[>[>[>[>[>[>[>[>[>[>', { ...component });
                        // }

                        return component.type_id === 187
                          ? await reformComponent(component)
                          : component;
                      }).filter(component => component != null)
                  )),
                }
              : { ...playground, team }
          }).filter(playground => playground != null)
        );

        dispatch({
          type: SET_REFORMED_TEAM_PLAYGROUNDS_SUMMARY,
          payload: { playgrounds }
        });


      } else if (type === BUILD_PLAYGROUNDS_LOADED) {
        const { playgroundID } = payload;

        const playgrounds = await Promise.all(
          payload.playgrounds.map(async playground => {
            const { device_id, components } = playground;
            delete playground["device_id"];

            //					console.log('playground', { id : playground.id, device_id, components });
            return {
              ...playground,
              deviceID: device_id,
              components: await Promise.all(
                components.map(
                  async component => await reformComponent(component)
                )
              )
            };
          })
        );





        dispatch(fetchPlaygroundComponentGroup({ 
          playground : { id : playgroundID }, 
          typeGroup : { id : 187 } 
        }));

        dispatch({
          type: SET_REFORMED_BUILD_PLAYGROUNDS,
          payload: { playgrounds, playgroundID, dataState : 3 }
        });
      } else if (type === USER_PROFILE_CACHED) {
      }

      return next(action);
    };
  };
}
