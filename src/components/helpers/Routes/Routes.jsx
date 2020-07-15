
import React, { Component } from 'react';
// import { Route, Switch, withRouter } from 'react-router-dom';
import { Redirect, Route, Switch } from 'react-router-dom';

import { RoutePaths } from './';
import BasePage from '../../pages/BasePage';
import ProjectPage from '../../pages/ProjectPage';
import TeamPage from '../../pages/TeamPage';
import { Pages } from '../../../consts/uris';



class Routes extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
		// console.log('%s.componentDidMount()-', this.constructor.name, this.props, this.state);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
		// console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);
  }


  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props });

    return (<Switch>
      <Route exact path={Pages.HOME}><Redirect to={Pages.TEAM} /></Route>

      <Route
        path={RoutePaths.INVITE}
        render={({ props })=> <BasePage
          onLogout={this.props.onLogout}
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)}
          onPopup={this.props.onPopup} { ...props}
          />
      } />

      <Route
        path={RoutePaths.PAYMENT}
        render={({ props })=> <BasePage
          onLogout={this.props.onLogout}
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)}
          onPopup={this.props.onPopup} { ...props}
          />
      } />

<Route
        path={RoutePaths.PROJECT}
        render={({ props })=> <ProjectPage
          onLogout={this.props.onLogout}
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)}
          onPopup={this.props.onPopup} { ...props}
          />
      } />

      <Route
        path={RoutePaths.TEAM}
        render={({ props })=> <TeamPage
          onLogout={this.props.onLogout}
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)}
          onPopup={this.props.onPopup} { ...props}
          />
      } />

      {/* <Route
        path={RoutePaths.PROJECT}
        render={({ props })=> <PlaygroundPage
          onLogout={this.props.onLogout}
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)}
          onPopup={this.props.onPopup} { ...props} />
      } /> */}

      <Route path={Pages.WILDCARD}><Redirect to={Pages.TEAM} /></Route>
    </Switch>);
  }
}


export default Routes;
// export default withRouter(Routes);
