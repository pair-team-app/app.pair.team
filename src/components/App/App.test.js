
import React from 'react';
import cookie from 'react-cookies';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter } from 'connected-react-router'

import App from './App';
import store, { history } from '../../redux/store';


const resolver = (data)=> {
  try {
    expect(data).eql(!null);
    done();

  } catch (error) {
    done(error);
  }
};



test('stores login cookie', async(done)=> {
  if (typeof cookie.load('cookies') === 'undefined') {
  	await cookie.save('cookies', '0', { path : '/', sameSite : false });
    resolver(true);
  }

  expect(true)
});


it('renders without crashing', async(done)=> {
  // const div = document.getElementById('root');
  const div = document.createElement('div');

  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Route path="/" render={(routeProps)=> <App { ...routeProps } />} />
      </ConnectedRouter>
    </Provider>,
	  div
  );
  ReactDOM.unmountComponentAtNode(div);

  done();
});
