
import cookie from 'react-cookies';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { fetchComponentTypes, fetchEventGroups, fetchProducts, fetchUserProfile } from '../actions';
import rootReducer from '../reducers/index';
import { onMiddleware } from '../middleware'


//const store = createStore(rootReducer, applyMiddleware(onMiddleware, thunk));

const composeEnhancers = composeWithDevTools({
	// options like actionSanitizer, stateSanitizer
});
const store = createStore(rootReducer, composeEnhancers(
	applyMiddleware(onMiddleware, thunk),
	// other store enhancers if any
));



//const composeEnhancers =
//	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
//		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
//			// options like actionSanitizer, stateSanitizer
//		}) : compose;




//const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//const store = createStore(rootReducer, /* preloadedState, */ composeEnhancers(applyMiddleware(onMiddleware, thunk)
//));

//const store = createStore(
//	rootReducer,
//	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
//	applyMiddleware(onMiddleware, thunk)
//);


if (typeof cookie.load('user_id') === 'undefined') {
	cookie.save('user_id', '0', { path : '/', sameSite : false });

} else {
	store.dispatch(fetchUserProfile());
}

store.dispatch(fetchComponentTypes());
store.dispatch(fetchEventGroups());
store.dispatch(fetchProducts());


export default store;
