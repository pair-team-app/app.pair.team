
import { BUILD_PLAYGROUNDS_LOADED, COMPONENT_TYPES_LOADED, DEVICES_LOADED, SET_COMPONENT, SET_PLAYGROUND, SET_TYPE_GROUP, TEAM_BUILDS_LOADED } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  componentTypes : [],
  devices        : [],
  builds         : null,
  playgrounds    : null,
  playground     : null,
  typeGroup      : null,
  components     : [],
  component      : null,
  device         : null
};

const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[builds] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};

export default function builds(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === COMPONENT_TYPES_LOADED) {
    const { componentTypes } = action.payload;
    return (Object.assign({}, state, { componentTypes : componentTypes }));

  } else if (type === DEVICES_LOADED) {
    const { devices } = action.payload;
    return (Object.assign({}, state, { devices }));

  } else if (type === TEAM_BUILDS_LOADED) {
    // const { playgrounds, comments, playground, typeGroup, components, component, comment } = payload;
    // return (Object.assign({}, state, { playgrounds, comments, playground, typeGroup, components, component, comment }));

    const { playgrounds, playground } = payload;
    return (Object.assign({}, state, { playgrounds, playground }));

  } else if (type === BUILD_PLAYGROUNDS_LOADED) {
    // const { playgrounds, comments, playground, typeGroup, components, component, comment } = payload;
    // return (Object.assign({}, state, { playgrounds, comments, playground, typeGroup, components, component, comment }));

    const { playgrounds, components } = payload;
    return (Object.assign({}, state, { playgrounds, components }));

  } else if (type === SET_PLAYGROUND) {
    const { playgrounds, playground } = payload;
    return (Object.assign({}, state, { playgrounds, playground }));

  } else if (type === SET_TYPE_GROUP) {
    const { typeGroup } = payload;
    return (Object.assign({}, state, { typeGroup }));

  } else if (type === SET_COMPONENT) {
    const { component } = payload;
    return (Object.assign({}, state, { component }));

  } else if (type === '@@router/LOCATION_CHANGE') {
    const { playgrounds, playground } = payload;

    if (playgrounds && playground) {
      return (Object.assign({}, state, { playgrounds, playground }));

    } else {
      return (state);
    }

  } else {
    return (state);
  }
}
