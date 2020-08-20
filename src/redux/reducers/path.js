
import { SET_ENTRY_HASH, SET_ROUTE_PATH } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';


const initialState = {
  params     : null,
  urlHistory : null
};


const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[path] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};


export default function user(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === '@@router/LOCATION_CHANGE') {
    const { urlHistory } = payload;
    return (Object.assign({}, state, { urlHistory }));

  } else if (type === SET_ROUTE_PATH) {
    const { params } = payload;
    return (Object.assign({}, state, { params }));

  } else {
    return (state);
  }
}