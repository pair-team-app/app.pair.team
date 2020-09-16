
import { BUILD_PLAYGROUNDS_LOADED, COMPONENT_TYPES_LOADED, DEVICES_LOADED, COMMENT_ADDED, SET_COMPONENT, SET_PLAYGROUND, SET_TEAM, TEAM_BUILDS_LOADED, SET_COMMENT, COMMENT_UPDATED } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';

const initialState = {
  componentTypes : [],
  devices        : [],
  builds         : null,
  playgrounds    : null,
  playground     : null,
  component      : null,
  comment        : null,
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

    const { playgrounds, playground, component, comment } = payload;
    return (Object.assign({}, state, { playgrounds, playground, component, comment }));

  } else if (type === BUILD_PLAYGROUNDS_LOADED) {
    // const { playgrounds, comments, playground, typeGroup, components, component, comment } = payload;
    // return (Object.assign({}, state, { playgrounds, comments, playground, typeGroup, components, component, comment }));

    const { playgrounds, components } = payload;
    return (Object.assign({}, state, { playgrounds, components }));

  } else if (type === COMMENT_ADDED) {
    const { playgrounds, playground, component, comment } = payload;
    return ((comment.types.includes('project')) ? Object.assign({}, state, { playgrounds, playground, component, comment }) : state);

  } else if (type === COMMENT_UPDATED) {
    const { playgrounds, playground, component, comment } = payload;
    return ((comment.types.includes('project')) ? Object.assign({}, state, { playgrounds, playground, component, comment }) : state);

  } else if (type === SET_PLAYGROUND) {
    const { playgrounds, playground } = payload;
    return (Object.assign({}, state, { playgrounds, playground }));

  } else if (type === SET_TEAM) {
    const { playgrounds } = payload;
    return (Object.assign({}, state, { playgrounds }));

  } else if (type === SET_COMPONENT) {
    const { component } = payload;
    return (Object.assign({}, state, { component }));

  } else if (type === SET_COMMENT) {
    const { comment } = payload;
    return ((!comment || comment.types.includes('project')) ? Object.assign({}, state, { comment }) : state);

  } else if (type === '@@router/LOCATION_CHANGE') {
    const { playgrounds, playground, component, comment } = payload;

    // if (playgrounds && playground) {
      return (Object.assign({}, state, { playgrounds, playground, component, comment }));

    // } else {
    //   return (state);
    // }

  } else {
    return (state);
  }
}
