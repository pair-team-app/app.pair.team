
import React, { Component } from 'react';
import './App.css';

import cookie from 'react-cookies';
import ReactPixel from 'react-facebook-pixel';
import { BrowserRouter, Route} from 'react-router-dom'

import HomePage from './components/pages/HomePage';
import InspectorPage from './components/pages/InspectorPage';
import InviteOverlay from './components/elements/InviteOverlay';
import ManifestoPage from './components/pages/ManifestoPage';
import PrivacyPage from './components/pages/PrivacyPage';
import StripeOverlay from './components/elements/StripeOverlay';
import RegisterOverlay from './components/elements/RegisterOverlay';
import SideNav from "./components/elements/SideNav";
import TermsPage from './components/pages/TermsPage';
import TopNav from './components/elements/TopNav';
import UploadOverlay from './components/elements/UploadOverlay';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			url           : window.location.pathname,
			section       : '0',
			selectedParts : [],
			overlayAlert  : null,
			user_id       : 0
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

		cookie.save('upload_id', '110', { path : '/' });
	}

	componentWillUnmount() {
	}

	handleInvite = ()=> {
		console.log('handleInvite()');
		this.setState({ overlayAlert : 'invite' });
	};

	handleRegistration = ()=> {
		console.log('handleRegistration()');
		this.setState({ overlayAlert: 'register' });
	};

	handleSideNavItem = (obj)=> {
		console.log('handleNavItem()', obj);
		this.setState({ section : obj.title });
	};

	handleUpload = ()=> {
		console.log('handleUpload()');
		this.setState({ overlayAlert: 'upload' });
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

	handleOverlay = (overlayType, buttonType)=> {
		console.log('handleOverlay()', overlayType, buttonType);
		this.setState({ overlayAlert : null });
		if (overlayType === 'register' && buttonType === 'submit') {
			this.setState({ user_id : 0 });
		}
	};

	handleDownload = ()=> {
		console.log('handleDownload()');
		this.setState({ overlayAlert: 'download' });
	};

	handleLogout = ()=> {
		cookie.remove('user_id');
		this.setState({ user_id : 0 });
	};

  render() {
    return (
    	<div className="page-wrapper">
		    <TopNav
			    url={this.state.url}
			    parts={this.state.selectedParts}
			    onUpload={()=> this.handleUpload()}
			    onDownload={()=> this.handleDownload()}
		    />
		    <SideNav
			    url={this.state.url}
			    onNavItem={(obj)=> this.handleSideNavItem(obj)}
			    onInvite={()=> this.handleInvite()}
			    onRegister={()=> this.handleRegistration()}
			    onLogout={()=> this.handleLogout()}
		    />

		    <BrowserRouter><div className="content-wrapper">
			    <Route exact path="/" render={()=> <HomePage section={this.state.section} onPartSelected={(obj)=> this.handlePartSelected(obj)} onPartClicked={(obj)=> this.handlePartDetails(obj)} />} />
			    <Route exact path="/manifesto" component={ManifestoPage} />
			    <Route exact path="/privacy" component={PrivacyPage} />
			    <Route exact path="/terms" component={TermsPage} />
			    <Route path="/render/:itemID" component={InspectorPage} />
		    </div></BrowserRouter>

		    {(this.state.overlayAlert === 'register') && (
			    <RegisterOverlay onClick={(buttonType)=>this.handleOverlay('register', buttonType)} />
		    )}

		    {(this.state.overlayAlert === 'invite') && (
			    <InviteOverlay onClick={(buttonType)=>this.handleOverlay('invite', buttonType)} />
		    )}

		    {(this.state.overlayAlert === 'upload') && (
		    	<UploadOverlay onClick={(buttonType)=>this.handleOverlay('upload', buttonType)} />
		    )}

		    {(this.state.overlayAlert === 'download') && (
			    <StripeOverlay onClick={(buttonType)=>this.handleOverlay('download', buttonType)} />
		    )}
	    </div>
    );
  }
}

export default App;
