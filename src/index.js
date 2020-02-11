
import React from 'react';
import cookie from 'react-cookies';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import App from './components/App';
import ScrollToTop from './components/helpers/ScrollToTop';
import './index.css';
import store from './redux/store';

window.store = store;

if (typeof cookie.load('cookies') === 'undefined') {
	cookie.save('cookies', '0', { path : '/', sameSite : false });
}


ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
		{/* <Route render={(props)=> <App />} /> */}
			{/* <ScrollToTop> */}
			{/* <Route path="/" render={} component={(props)=> <App />} /> */}
				<Route path="/" render={(routeProps)=> <App { ...routeProps } />} />
				{/* <App /> */}
			{/* </ScrollToTop> */}
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);


// word