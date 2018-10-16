
import React, { Component } from 'react';
import './App.css';

import cookie from 'react-cookies';
import ReactPixel from 'react-facebook-pixel';
import { Route, withRouter } from 'react-router-dom'

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
			section       : '0',
			pageID        : 0,
			artboardID    : 0,
			sliceID       : 0,
			selectedArtboards : [],
			overlayAlert  : null,
			userID        : 0
		};
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' };
		const options = {
			autoConfig : true,
			debug      : false
		};

		ReactPixel.init('318191662273348', advancedMatching, options);
		ReactPixel.trackCustom('load');

		if (window.location.pathname.includes('/render/')) {
			this.setState({ pageID : window.location.pathname.match(/\/\d+\//)[1] });
		}

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

	handleSideNavPageItem = (obj)=> {
		console.log('handleSideNavPageItem()', obj);
		this.setState({ pageID : obj.id });
	};

	handleSideNavArtboardItem = (obj)=> {
		console.log('handleSideNavArtboardItem()', obj);
		this.setState({ artboardID : obj.id });
	};

	handleSideNavSliceItem = (obj)=> {
		console.log('handleSideNavSliceItem()', obj);
		this.setState({ slice : obj.id });
	};

	handleUpload = ()=> {
		console.log('handleUpload()');
		this.setState({ overlayAlert: 'upload' });
	};

	handleArtboardSelected = (obj)=> {
		console.log('handleArtboardSelected()', obj);
		let selectedArtboards = this.state.selectedArtboards;
		if (obj.selected) {
			let isFound = false;
			selectedArtboards.forEach(function(item, i) {
				if (item.id === obj.id) {
					isFound = true;
				}
			});

			if (!isFound) {
				selectedArtboards.push(obj);
			}

		} else {
			selectedArtboards.forEach(function(item, i) {
				if (item.id === obj.id) {
					selectedArtboards.splice(i, 1);
				}
			});
		}

		this.setState({ selectedArtboards : selectedArtboards });
	};

	handleArtboardDetails = (obj)=> {
		console.log('handleArtboardDetails()', obj);
		this.setState({
			pageID     : obj.pageID,
			artboardID : obj.id
		});

		this.props.history.push('/render/' + obj.pageID + '/' + obj.id);
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
  	console.log('state', this.state);

    return (
    	<div className="page-wrapper">
		    <TopNav
			    parts={this.state.selectedArtboards}
			    onUpload={()=> this.handleUpload()}
			    onDownload={()=> this.handleDownload()}
		    />
		    <SideNav
			    pageID={this.state.pageID}
			    onPageItem={(obj)=> this.handleSideNavPageItem(obj)}
			    onArtboardItem={(obj)=> this.handleSideNavArtboardItem(obj)}
			    onSliceItem={(obj)=> this.handleSideNavSliceItem(obj)}
			    onInvite={()=> this.handleInvite()}
			    onRegister={()=> this.handleRegistration()}
			    onLogout={()=> this.handleLogout()}
		    />

		    <div className="content-wrapper">
			    <Route exact path="/" render={()=> <HomePage pageID={this.state.pageID} onArtboardSelected={(obj)=> this.handleArtboardSelected(obj)} onArtboardClicked={(obj)=> this.handleArtboardDetails(obj)} />} />
			    <Route exact path="/manifesto" component={ManifestoPage} />
			    <Route exact path="/privacy" component={PrivacyPage} />
			    <Route path="/render/:pageID/:artboardID" component={InspectorPage} />
			    <Route exact path="/terms" component={TermsPage} />
		    </div>

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

export default withRouter(App);
