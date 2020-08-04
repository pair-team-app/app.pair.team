
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import cookie from 'react-cookies';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import thunk from 'redux-thunk';

import { fetchComponentTypes, fetchDevices, fetchProducts, fetchUserProfile } from '../actions';
import rootReducer from '../reducers/index';
import { onMiddleware } from '../middleware'

import { SET_PLAYGROUND, SET_TYPE_GROUP, SET_COMPONENT, SET_COMMENT } from '../../consts/action-types';

export const history = createBrowserHistory();


const createLogActionStackTraceMiddleware = (actionTypes=[])=> {
  const logActionStackTraceMiddleware = (storeAPI)=> (next)=> (action)=> {
    if(action.type && actionTypes.includes(action.type)) {
    	// console.log('[|:|] Store', storeAPI.getState());
      console.trace('[:|:] "%s" %s', action.type, action);
    }

    return (next(action));
  };

  return (logActionStackTraceMiddleware);
};


const stackTraceMiddleware = createLogActionStackTraceMiddleware([SET_PLAYGROUND, SET_TYPE_GROUP, SET_COMPONENT, SET_COMMENT]);


// const store = createStore(rootReducer, compose(applyMiddleware(onMiddleware, thunk, stackTraceMiddleware)));
const store = createStore(rootReducer(history), composeWithDevTools(applyMiddleware(routerMiddleware(history), onMiddleware, thunk, stackTraceMiddleware)));


if (typeof cookie.load('user_id') === 'undefined') {
	cookie.save('user_id', '0', { path : '/', sameSite : false });

} else {
	store.dispatch(fetchUserProfile());
}

store.dispatch(fetchComponentTypes());
store.dispatch(fetchDevices());
store.dispatch(fetchProducts());

export default store;