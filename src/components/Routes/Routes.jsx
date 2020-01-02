
import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import DocsPage from '../pages/DocsPage';
import FeaturesPage from '../pages/FeaturesPage';
import HomePage from '../pages/HomePage';
import PlaygroundPage from '../pages/PlaygroundPage';
import PricingPage from '../pages/PricingPage';
import PrivacyPage from '../pages/PrivacyPage';
import Status404Page from '../pages/Status404Page';
import TermsPage from '../pages/TermsPage';


import { Pages } from '../../consts/uris';


class Routes extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);
  }


  render() {
    console.log('%s.render()', this.constructor.name, this.props, this.state);

    return (<div>
      <Switch>
        <Route exact path={Pages.HOME} render={()=> <HomePage onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} onPopup={this.props.onPopup} onSignup={()=> null} />} />
        <Route exact path={Pages.DOCS} render={()=> <DocsPage onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} onPopup={this.props.onPopup} />} />
        <Route exact path={Pages.FEATURES} render={()=> <FeaturesPage onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} onPopup={this.props.onPopup} />} />
        <Route exact path={`${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:playgroundID([0-9]+)?/:componentsSlug([A-Za-z-]+)?/:componentID([0-9]+)?/(accessibility)?/(comments)?/:commentID([0-9]+)?`} render={(props)=> <PlaygroundPage { ...props } onLogout={this.props.onLogout} onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} onPopup={this.props.onPopup} />} />
        <Route exact path={Pages.PRICING} render={()=> <PricingPage onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} onPopup={this.props.onPopup} />} />
        <Route exact path={`/:page(${Pages.LEGAL.slice(1)}|${Pages.PRIVACY.slice(1)})`} component={PrivacyPage} />
        <Route exact path={Pages.TERMS} component={TermsPage} />

        <Route path={Pages.WILDCARD}><Status404Page /></Route>
      </Switch>
    </div>);
  }
}


export default withRouter(Routes);
