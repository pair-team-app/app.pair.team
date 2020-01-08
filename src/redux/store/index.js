
import cookie from 'react-cookies';
import { applyMiddleware, createStore, compose } from 'redux';
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

const createLogActionStackTraceMiddleware = (actionTypes = []) => {
  const logActionStackTraceMiddleware = (storeAPI)=> (next)=> (action)=> {
    if(action.type && actionTypes.includes(action.type)) {
      console.log(`[|] Action: ${action.type}`);
    }

    return (next(action));
  };

  return (logActionStackTraceMiddleware);
};


const stackTraceMiddleware = createLogActionStackTraceMiddleware(['SET_PLAYGROUND', 'SET_TYPE_GROUP', 'SET_COMPONENT']);


// const store = createStore(rootReducer, applyMiddleware(onMiddleware, thunk));
const store = createStore(rootReducer, compose(applyMiddleware(onMiddleware, thunk, stackTraceMiddleware)));
// store.dispatch = attachDispatchLog(store);


if (typeof cookie.load('user_id') === 'undefined') {
	cookie.save('user_id', '0', { path : '/', sameSite : false });

} else {
	store.dispatch(fetchUserProfile());
}

store.dispatch(fetchComponentTypes());
store.dispatch(fetchEventGroups());
store.dispatch(fetchProducts());



export default store;
