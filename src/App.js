
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
			url           : window.location.pathname,
			section       : '0',
			selectedParts : []
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

	handleInvite = ()=> {
		console.log('handleInvite()');
	};

	handleRegistration = ()=> {
		console.log('handleRegistration()');
	};

	handleSideNavItem = (obj)=> {
		console.log('handleNavItem()', obj);
		this.setState({ section : obj.title });
	};

	handleUpload = ()=> {
		console.log('handleUpload()');
	};

	handlePartSelected = (obj)=> {
		console.log('handlePartSelected()', obj);
		let selectedParts = this.state.selectedParts;
		if (obj.selected) {
			let isFound = false;
			selectedParts.forEach(function(item, i) {
				if (item.id === obj.id) {
					isFound = true;
				}
			});

			if (!isFound) {
				selectedParts.push(obj);
			}

		} else {
			selectedParts.forEach(function(item, i) {
				if (item.id === obj.id) {
					selectedParts.splice(i, 1);
				}
			});
		}

		this.setState({ selectedParts : selectedParts });
	};

	handlePartDetails = (obj)=> {
		console.log('handlePartDetails()', obj);
		window.location.href = '/render/' + obj.id;
	};


  render() {
    return (
    	<div className="page-wrapper">
		    <TopNav url={this.state.url} onUpload={()=> this.handleUpload()} parts={this.state.selectedParts} />
		    <SideNav url={this.state.url} onNavItem={(obj)=> this.handleSideNavItem(obj)} onInvite={()=> this.handleInvite()} onRegister={()=> this.handleRegistration()} />

		    <BrowserRouter><div className="content-wrapper debug-border">
			    <Route exact path="/" render={()=> <HomePage section={this.state.section} onPartSelected={(obj)=> this.handlePartSelected(obj)} onPartClicked={(obj)=> this.handlePartDetails(obj)} />} />
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
