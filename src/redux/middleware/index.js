
import moment from "moment";
import cookie from "react-cookies";
import { reformComponent } from "../../components/pages/PlaygroundPage/utils/reform";
import { BUILD_PLAYGROUNDS_LOADED, TEAM_LOADED, SET_REFORMED_BUILD_PLAYGROUNDS, 
  SET_REFORMED_TEAM_PLAYGROUNDS_SUMMARY, SET_REFORMED_TYPE_GROUP, TEAM_PLAYGROUNDS_SUMMARY_LOADED, 
  TYPE_GROUP_LOADED, UPDATE_MOUSE_COORDS, USER_PROFILE_CACHED, 
  USER_PROFILE_UPDATED, 
  USER_PROFILE_LOADED} from "../../consts/action-types";
import { LOG_MIDDLEWARE_PREFIX } from "../../consts/log-ascii";
import { fetchTeamPlaygroundsSummary, fetchPlaygroundComponentGroup, fetchTeamLookup } from "../actions";

const logFormat = ({ store, action, next, meta = "" }) => {
  if (typeof action !== "function") {
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
      logFormat({ store : store.getState(), action, next });

      const { type, payload } = action;
      if (type === USER_PROFILE_LOADED) {
        dispatch(fetchTeamLookup({ userID : payload.id }));

      } else if (type === TEAM_LOADED) {
         dispatch(fetchTeamPlaygroundsSummary({ team : payload }));

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
        cookie.save("user_id", payload ? payload.id : "0", {
          path: "/",
          sameSite: false
        });

      } else if (type === TEAM_PLAYGROUNDS_SUMMARY_LOADED) {
        const { team } = payload;
        const playgrounds = await Promise.all(
          payload.playgrounds.map(async (playground, i) => {
            const { build_id, team_id, device_id, components, last_visited } = playground;
            delete playground["build_id"];
            delete playground["team_id"];
            delete playground["device_id"];
            delete playground["last_visited"];

            const deviceID = device_id;
            return deviceID === 1
              ? {
                  ...playground,
                  team,
                  buildID : build_id << 0,
                  teamID : team_id << 0,
                  lastVisited : moment(last_visited),
                  deviceID,
                  components
                }
              : { ...playground, team }
          }).filter(playground => playground != null)
        );

        payload.playgrounds = playgrounds;

      } else if (type === BUILD_PLAYGROUNDS_LOADED) {
        const { playgroundID } = payload;

        const playgrounds = await Promise.all(
          payload.playgrounds.map(async playground => {
            const { build_id, team_id, device_id, components, last_visited } = playground;
            delete playground["build_id"];
            delete playground["team_id"];
            delete playground["device_id"];
            delete playground["last_visited"];

            // console.log('playground', { id : playground.id, device_id, components });
            return {
              ...playground,
              buildID: build_id << 0,
              teamID: team_id << 0,
              deviceID: device_id << 0,
              lastVisited: moment(last_visited),
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

      } else if (type === USER_PROFILE_CACHED) {
      }

      return next(action);
    };
  };
}
