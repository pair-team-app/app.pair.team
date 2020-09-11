
import { USER_PROFILE_ERROR, USER_PROFILE_LOADED, USER_PROFILE_UPDATED, SET_USER_PROFILE_PASSWORD } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';


const initialState = {
  profile : null
};


const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[user] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};


export default function user(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === USER_PROFILE_ERROR || type === USER_PROFILE_LOADED) {
    const { profile } = payload;
    return (Object.assign({}, state, { profile }));

  } else if (type === USER_PROFILE_UPDATED) {
    const { profile } = payload;
    return (Object.assign({}, state, { profile }));

  } else if (type === SET_USER_PROFILE_PASSWORD) {
    const { profile } = state;
    const { password } = payload;

    return (Object.assign({}, state, { profile : { ...profile, password } }));

  } else {
    return (state);
  }
}