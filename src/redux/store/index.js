
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers/index';
import { onMiddleware } from '../middleware'

const store = createStore(rootReducer, applyMiddleware(onMiddleware, thunk));

//-- call api here! --//
// store.dispatch --ACTION--
//-------------- --------------//

export default store;
