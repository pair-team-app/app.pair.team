
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import cookie from 'react-cookies';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
// import ScrollToTop from 'react-router-scroll-top';

import ScrollToTop from './components/helpers/ScrollToTop';

import App from './components/App';
import store from './redux/store';


window.store = store;

if (typeof cookie.load('cookies') === 'undefined') {
	cookie.save('cookies', '0', { path : '/', sameSite : false });
}


ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
			<ScrollToTop>
				<App />
			</ScrollToTop>
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);
