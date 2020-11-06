
import React from 'react';
import { shallow, mount, render } from 'enzyme';

import cookie from 'react-cookies';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter } from 'connected-react-router'

import App from './App';
import store, { history } from '../../redux/store';


test('stores login cookie', (done)=> {
  if (typeof cookie.load('cookies') === 'undefined') {
  	cookie.save('cookies', '0', { path : '/', sameSite : false });
  }

  try {
    const cookies = (cookie.load('cookies') << 0);
    expect(cookies).toBeDefined();
    console.log('stores login cookie', { cookies });
    done();

  } catch (error) {
    done(error);
  }
});



it('renders App w/o crashing', (done)=> {
  try {
    shallow(<Provider store={store}>
      <ConnectedRouter history={history}>
        <Route path="/" render={(routeProps)=> <App { ...routeProps } />} />
      </ConnectedRouter>
    </Provider>);

    console.log('renders App w/o crashing', { component : true });
    done();

  } catch (error) {
  done(error);
}
});




test('renders App fully w/o crashing', (done)=> {
  try {
    const component = mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Route path="/" render={(routeProps)=> <App { ...routeProps } />} />
        </ConnectedRouter>
      </Provider>
    );

    const testElement = <div className={`test-element test-element-app is-hidden`}></div>;
    expect(component.contains(testElement)).toBe(true);
    console.log('renders App fully w/o crashing', { props : { ...component.props() }});
    done();

  } catch (error) {
    done(error);
  }
});
