
import React, { Component } from 'react';
// import { Route, Switch, withRouter } from 'react-router-dom';
import { Redirect, Route, Switch } from 'react-router-dom';

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
        path={`${Pages.TEAM}/:teamSlug([a-z-]+)?/(comments)?/:commentID([0-9]+)?`}
        render={({ props })=> <TeamPage
          onLogout={this.props.onLogout}
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)}
          onPopup={this.props.onPopup} { ...props}
          />
      } />

      {/* <Route
        path={`${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:deviceSlug([a-z0-9-]+)?/:typeGroupSlug([a-z-]+)?/:componentID([0-9]+)?/:ax(accessibility)?/:comments(comments)?/:commentID([0-9]+)?`}
        // path={Pages.PLAYGROUND}
        render={({ props })=> <PlaygroundPage
          onLogout={this.props.onLogout}
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)}
          onPopup={this.props.onPopup} { ...props} />
      } /> */}

      {/* <Route path={Pages.WILDCARD}><Status404Page /></Route> */}
      <Route path={Pages.WILDCARD}><Redirect to={Pages.team} /></Route>
    </Switch>);
  }
}


export default Routes;
// export default withRouter(Routes);
