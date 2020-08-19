
import React from 'react';
import cookie from 'react-cookies';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter } from 'connected-react-router'

import App from './components/App';
// import ScrollToTop from './components/helpers/ScrollToTop';
import './index.css';
import store, { history } from './redux/store';

window.store = store;
// let scrollableElement = null;

if (typeof cookie.load('cookies') === 'undefined') {
	cookie.save('cookies', '0', { path : '/', sameSite : false });
}


ReactDOM.render(
	<Provider store={store}>
		{/* <ConnectedRouter history={history}> */}
		<ConnectedRouter history={history}>
			{/* <ScrollToTop props={{ scrollableElement }}> */}
				<Route path="/" render={(routeProps)=> <App { ...routeProps } />} />
				{/* <App /> */}
			{/* </ScrollToTop> */}
		</ConnectedRouter>
	</Provider>,
	document.getElementById('root')
);
//
//
//
//
