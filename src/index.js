
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
let scrollableElement = null;

if (typeof cookie.load('cookies') === 'undefined') {
	cookie.save('cookies', '0', { path : '/', sameSite : false });
}


const handleScrollRef = (ref)=> {
	console.log('///////////',ref,'\\\\\\\\\\\\\\');
	scrollableElement = ref;
};


ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
		{/* <Route render={(props)=> <App />} /> */}
			<ScrollToTop props={{ scrollableElement }}>
			{/* <Route path="/" render={} component={(props)=> <App />} /> */}
				<Route path="/" render={(routeProps)=> <App { ...routeProps } onScrollRef={(ref)=> handleScrollRef(ref)} />} />
				{/* <App /> */}
			</ScrollToTop>
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);
//
