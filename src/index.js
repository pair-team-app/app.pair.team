
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import store from './redux/store/index';


window.store = store;

ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter onUpdate={()=> window.documentElement.scrollTo(0, 0)}>
			<App />
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);
