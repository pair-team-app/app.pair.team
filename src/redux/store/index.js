
import cookie from 'react-cookies';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import { fetchUserProfile } from '../actions';

import rootReducer from '../reducers/index';
import { onMiddleware } from '../middleware'


const store = createStore(rootReducer, applyMiddleware(onMiddleware, thunk));


if (typeof cookie.load('user_id') !== 'undefined') {
	store.dispatch(fetchUserProfile());
}


export default store;
