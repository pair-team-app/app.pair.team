
import cookie from 'react-cookies';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { fetchComponentTypes, fetchEventGroups, fetchProducts, fetchUserProfile } from '../actions';
import { onMiddleware } from '../middleware';
import rootReducer from '../reducers';


//const store = createStore(rootReducer, applyMiddleware(onMiddleware, thunk));
const store = createStore(rootReducer, composeWithDevTools({})(applyMiddleware(onMiddleware, thunk)));


if (typeof cookie.load('user_id') === 'undefined') {
	cookie.save('user_id', '0', { path : '/', sameSite : false });

} else {
	store.dispatch(fetchUserProfile());
}

store.dispatch(fetchComponentTypes());
store.dispatch(fetchEventGroups());
store.dispatch(fetchProducts());


export default store;
