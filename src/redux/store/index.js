
import { push, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import cookie from 'react-cookies';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';

import { fetchComponentTypes, fetchDevices, fetchProducts, fetchUserProfile } from '../actions';
import rootReducer from '../reducers/index';
import { onMiddleware } from '../middleware'

import { SET_ROUTE_PATH, SET_TEAM, SET_PLAYGROUND, SET_COMMENT, COMMENT_CREATED } from '../../consts/action-types';
import { Modals, Pages } from '../../consts/uris.js';

export const history = createBrowserHistory();


const createLogActionStackTraceMiddleware = (actionTypes=[])=> {
  const logActionStackTraceMiddleware = (storeAPI)=> (next)=> (action)=> {
    if(action.type && actionTypes.includes(action.type)) {
    	console.log('[|:|] Store', storeAPI.getState());
      console.trace('[:|:]', 'TYPE:[”%s“] ACTION:[%s] NEXT:[%s] ', action.type, action, next, '[:|:]');
    }

    return (next(action));
  };

  return (logActionStackTraceMiddleware);
};


const stackTraceMiddleware = createLogActionStackTraceMiddleware(['@@router/LOCATION_CHANGE', SET_ROUTE_PATH, SET_TEAM, SET_PLAYGROUND, SET_COMMENT, COMMENT_CREATED]);


// const store = createStore(rootReducer, compose(applyMiddleware(onMiddleware, thunk, stackTraceMiddleware)));
const store = createStore(rootReducer(history), composeWithDevTools(applyMiddleware(routerMiddleware(history), onMiddleware, thunk, stackTraceMiddleware)));


if (typeof cookie.load('user_id') === 'undefined') {
  cookie.save('user_id', '0', { path : '/', sameSite : false });
  // const { pathname, hash } = store.getState().router.location;

  // if ([Modals.LOGIN, Modals.REGISTER, Modals.RECOVER].filter((modal)=> (hash === modal)).length === 0)
  // store.dispatch(push(`${Pages.TEAM}${Modals.REGISTER}`));

} else {
  // if ((cookie.load('user_id') << 0) !== 0) {
    store.dispatch(fetchUserProfile());
  // }
}

store.dispatch(fetchComponentTypes());
store.dispatch(fetchDevices());
store.dispatch(fetchProducts());

export default store;