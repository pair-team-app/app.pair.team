
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers/index';
import { userProfileUpdateErrorMiddleware } from '../middleware'

const store = createStore(rootReducer, applyMiddleware(userProfileUpdateErrorMiddleware, thunk));
// const store = createStore(rootReducer);

export default store;
