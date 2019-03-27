
import React from 'react';
import ReactDOM from 'react-dom';
// import 'primer/index.scss';
import './index.css';

import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'

import App from './components/App';
// import registerServiceWorker from './registerServiceWorker';
import store from './redux/store/index';


window.store = store;


ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</Provider>,
	document.getElementById('root')
);

// registerServiceWorker();
