
import cookie from 'react-cookies';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import { fetchComponentTypes, fetchEventGroups, fetchProducts, fetchUserProfile } from '../actions';
import { onMiddleware } from '../middleware';
import rootReducer from '../reducers';


const attachDispatchLog = (store)=> {
	const rawDispatch = store.dispatch;
	return ((action)=> {
		console.group(action.type);
		console.log('[:]', 'ACTION [%s]--> STORE PREV STATE', action, store.getState(), '[:]');

		const retVal = rawDispatch(action);
    console.log('[:]', 'ACTION [%s]--> STORE NEXT STATE', store.getState(), '[:]');
		console.groupEnd();

		return (retVal);

	})
};



const store = createStore(rootReducer, applyMiddleware(onMiddleware, thunk));
store.dispatch = attachDispatchLog(store);


if (typeof cookie.load('user_id') === 'undefined') {
	cookie.save('user_id', '0', { path : '/', sameSite : false });

} else {
	store.dispatch(fetchUserProfile());
}

store.dispatch(fetchComponentTypes());
store.dispatch(fetchEventGroups());
store.dispatch(fetchProducts());



export default store;
