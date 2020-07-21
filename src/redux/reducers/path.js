
import { SET_ENTRY_ROUTE_PATH, SET_ROUTE_PATH } from '../../consts/action-types';
import { LOG_REDUCER_POSTFIX, LOG_REDUCER_PREFIX } from '../../consts/log-ascii';


const initialState = {
  params : null
};


const logFormat = (state, action, meta='')=> {
  const { type, payload } = action;
  console.log(LOG_REDUCER_PREFIX, `REDUCER[path] >> “${type}”`, { state, payload, meta }, LOG_REDUCER_POSTFIX);
};


export default function user(state=initialState, action) {
  const { type, payload } = action;
  logFormat(state, action);

  if (type === SET_ENTRY_ROUTE_PATH) {
    const { params } = payload;
    return (Object.assign({}, state, { params }));

  } else if (type === SET_ROUTE_PATH) {
    const { params } = payload;
    return (Object.assign({}, state, { params }));

  } else {
    return (state);
  }
}