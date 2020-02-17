
import React, { Component } from 'react';
// import { Route, Switch, withRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router-dom';
import { Pages } from '../../../consts/uris';
import DocsPage from '../../pages/DocsPage/index';
import FeaturesPage from '../../pages/FeaturesPage/index';
import HomePage from '../../pages/HomePage/index';
import PlaygroundPage from '../../pages/PlaygroundPage/index';
import PricingPage from '../../pages/PricingPage/index';
import PrivacyPage from '../../pages/PrivacyPage/index';
import Status404Page from '../../pages/Status404Page/index';
import TermsPage from '../../pages/TermsPage/index';



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
    console.log('%s.render()', this.constructor.name, { props : this.props });

    return (<Switch>
      <Route exact 
	      path={Pages.HOME} 
        children={()=> <HomePage 
            onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} 
            onPopup={this.props.onPopup} 
            onSignup={()=> null} />}
        />

      <Route exact 
        path={Pages.HOME} 
        children={()=> <HomePage
            onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} 
            onPopup={this.props.onPopup} 
            onSignup={()=> null} />
        } />
      
      <Route exact 
        path={Pages.DOCS} 
        children={()=> <DocsPage
            onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} 
            onPopup={this.props.onPopup} />
        } />
      
      <Route exact 
        path={Pages.FEATURES} 
        children={()=> <FeaturesPage
            onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} 
            onPopup={this.props.onPopup} />
       } />
      
      <Route exact 
        path={Pages.FEATURES} 
        children={()=> <FeaturesPage
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} 
          onPopup={this.props.onPopup} />
        }/>

      <Route  
        path={`${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:deviceSlug([a-z0-9-]+)?/:componentsSlug([a-z-]+)?/:componentID([0-9]+)?/(accessibility)?/(comments)?/:commentID([0-9]+)?`} 
        // path={Pages.PLAYGROUND} 
        render={({ props })=> <PlaygroundPage 
          onLogout={this.props.onLogout} 
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} 
          onPopup={this.props.onPopup} { ...props} />
         } />

      <Route exact 
        path={Pages.PRICING} 
        children={()=> <PricingPage
          onModal={(uri, payload)=> this.props.onModal(uri, true, payload)} 
          onPopup={this.props.onPopup} />
        } />

      <Route exact 
        path={`/:page(${Pages.LEGAL.slice(1)}|${Pages.PRIVACY.slice(1)})`} 
        component={PrivacyPage} />

      <Route exact 
        path={Pages.TERMS} 
        component={TermsPage} 
      />

    
      <Route path={Pages.WILDCARD}><Status404Page /></Route>
    </Switch>);
  }
}


export default Routes;
// export default withRouter(Routes);
