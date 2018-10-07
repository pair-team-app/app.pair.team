
import React, { Component } from 'react';
import './App.css';

import ReactPixel from 'react-facebook-pixel';
import { BrowserRouter, Route} from 'react-router-dom'

import HomePage from './components/pages/HomePage';
import InspectorPage from './components/pages/InspectorPage';
import ManifestoPage from './components/pages/ManifestoPage';
import PrivacyPage from './components/pages/PrivacyPage';
import SideNav from "./components/elements/SideNav";
import TermsPage from './components/pages/TermsPage';
import TopNav from './components/elements/TopNav';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			url     : window.location.pathname,
			section : '0'
		};
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' };
		const options = {
			autoConfig : true,
			debug      : false,
		};

		ReactPixel.init('318191662273348', advancedMatching, options);
		ReactPixel.trackCustom('load');
	}

	componentWillUnmount() {
	}

	handleSideNavItem = (obj)=> {
		console.log('handleNavItem()', obj);
		this.setState({ section : obj.title });
	};

	handleUpload = ()=> {
		console.log('handleUpload()');
	};


  render() {
    return (
    	<div className="page-wrapper">
		    <TopNav url={this.state.url} onUpload={()=> this.handleUpload()} />
		    <SideNav url={this.state.url} onNavItem={(obj)=> this.handleSideNavItem(obj)} />

		    <BrowserRouter><div className="content-wrapper">
			    <Route exact path="/" render={()=> <HomePage section={this.state.section} />} />
			    <Route exact path="/manifesto" component={ManifestoPage} />
			    <Route exact path="/privacy" component={PrivacyPage} />
			    <Route exact path="/terms" component={TermsPage} />
			    <Route path="/render/:itemID" component={InspectorPage} />
		    </div></BrowserRouter>
	    </div>
    );
  }
}

export default App;
