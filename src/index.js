
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import cookie from 'react-cookies';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import store from './redux/store/index';


window.store = store;

if (typeof cookie.load('cookies') === 'undefined') {
	cookie.save('cookies', '0', { path : '/', sameSite : false });
}


ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter onUpdate={()=> { console.log('::::::::::', window.document.documentElement); window.document.documentElement.scrollTo(0, 0)}}>
			<App />
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);
