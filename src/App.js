
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import cookie from 'react-cookies';
import ReactPixel from 'react-facebook-pixel';
import { Route, Switch, withRouter } from 'react-router-dom'

import DevelopersPage from './components/pages/DevelopersPage';
import HomePage from './components/pages/HomePage';
import InspectorPage from './components/pages/InspectorPage';
import InviteOverlay from './components/elements/InviteOverlay';
import MissionPage from './components/pages/MissionPage';
import PrivacyPage from './components/pages/PrivacyPage';
import StripeOverlay from './components/elements/StripeOverlay';
import RegisterOverlay from './components/elements/RegisterOverlay';
import SideNav from './components/elements/SideNav';
import Status404Page from './components/pages/Status404Page';
import TermsPage from './components/pages/TermsPage';
import TopNav from './components/elements/TopNav';
import UploadOverlay from './components/elements/UploadOverlay';

const wrapper = React.createRef();

class App extends Component {
	constructor(props) {
		super(props);

		const artboardPatt = /\/artboard\/\d+\/\d+\/\d+\/.*$/;
		const uploadPatt = /\/doc\/\d+\/.*$/;

		this.state = {
			uploadID          : (artboardPatt.test(window.location.pathname)) ? window.location.pathname.match(/\/artboard\/(\d+)\/.*$/)[1] : (uploadPatt.test(window.location.pathname)) ? window.location.pathname.match(/\/doc\/(\d+)\/.*$/)[1] : 0,
			pageID            : (artboardPatt.test(window.location.pathname)) ? window.location.pathname.match(/\/artboard\/\d+\/(\d+)\/.*$/)[1] : 0,
			artboardID        : (artboardPatt.test(window.location.pathname)) ? window.location.pathname.match(/\/artboard\/\d+\/\d+\/(\d+)\/.*$/)[1] : 0,
			sliceID           : 0,//(window.location.pathname.includes('/artboard/')) ? window.location.pathname.match(/\/artboard\/\d+\/\d+\/.+\/(\d+)?/)[1] : 0,
			selectedArtboards : [],
			overlayAlert      : null,
			userID            : 0
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

		if (window.location.pathname.includes('/artboard/')) {
			let formData = new FormData();

			if (this.state.uploadID === 0) {
				formData.append('action', 'PAGE');
				formData.append('page_id', this.state.pageID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('PAGE', response.data);
						this.setState({ uploadID : response.data.page.upload_id });
					}).catch((error) => {
				});
			}

			formData.append('action', 'ADD_VIEW');
			formData.append('artboard_id', this.state.artboardID);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('ADD_VIEW', response.data);
				}).catch((error) => {
			});
		}
	}

	handleHome = ()=> {
		this.setState({
			uploadID   : 0,
			pageID     : 0,
			artboardID : 0
		});

		this.props.history.push('/');
	};

	handleSideNavUploadItem = (obj)=> {
		console.log('handleSideNavUploadItem()', obj);

		if (obj.selected) {
			this.props.history.push('/doc/' + obj.id + '/' + obj.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
		}

		this.setState({
			uploadID   : (obj.selected) ? obj.id : 0,
			pageID     : 0,
			artboardID : 0
		});
	};

	handleSideNavPageItem = (obj)=> {
		console.log('handleSideNavPageItem()', obj);
		this.setState({ pageID : (obj.selected) ? obj.id : 0 });
	};

	handleSideNavArtboardItem = (obj)=> {
		console.log('handleSideNavArtboardItem()', obj);
		let formData = new FormData();
		formData.append('action', 'ADD_VIEW');
		formData.append('artboard_id', obj.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('ADD_VIEW', response.data);
				this.props.history.push('/artboard/' + this.state.uploadID + '/' + obj.pageID + '/' + obj.id + '/' + obj.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
				this.setState({
					pageID     : obj.pageID,
					artboardID : obj.id
				});
			}).catch((error) => {
		});
	};

	handleSideNavSliceItem = (obj)=> {
		console.log('handleSideNavSliceItem()', obj);
// 		this.props.history.push('/artboard/' + this.state.pageID + '/' + this.state.artboardID + '/' + obj.id);
// 		this.setState({ sliceID : obj.id });
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
		wrapper.current.scrollTo(0, 0);

		let formData = new FormData();
		formData.append('action', 'ADD_VIEW');
		formData.append('artboard_id', obj.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('ADD_VIEW', response.data);
				this.props.history.push('/artboard/' + this.state.uploadID + '/' + obj.pageID + '/' + obj.id + '/' + obj.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase());
				this.setState({
					pageID     : obj.pageID,
					artboardID : obj.id
				});
			}).catch((error) => {
		});
	};

	handleOverlay = (overlayType, buttonType)=> {
		console.log('handleOverlay()', overlayType, buttonType);
		this.setState({ overlayAlert : null });
		if (overlayType === 'register') {
			if (buttonType === 'submit') {
				this.setState({ user_id : 0 });
				window.location.reload();
			}

		} else if (overlayType === 'upload') {
			if (buttonType === 'background') {
				window.location.reload();

			} else if (buttonType === 'complete') {
				window.location.reload();
			}
		}
	};

	handleAddOns = ()=> {
		console.log('handleAddOns()');
// 		this.setState({ overlayAlert: 'download' });
	};

	handleLogout = ()=> {
		cookie.save('user_id', '0', { path : '/' });
		this.setState({ userID : 0 });
		window.location.href = '/';
	};

  render() {
  	console.log('App.state', this.state);

    return (
    	<div className="page-wrapper">
		    <TopNav
			    parts={this.state.selectedArtboards}
			    artboardID={this.state.artboardID}
			    onHome={()=> this.handleHome()}
			    onAddOns={()=> this.handleAddOns()}
			    onUpload={()=> this.handleUpload()}
		    />
		    <SideNav
			    uploadID={this.state.uploadID}
			    pageID={this.state.pageID}
			    artboardID={this.state.artboardID}
			    sliceID={this.state.sliceID}
			    onBack={()=> window.location.href = '/'}
			    onTop={()=> this.setState({ pageID : -1 })}
			    onUploadItem={(obj)=> this.handleSideNavUploadItem(obj)}
			    onPageItem={(obj)=> this.handleSideNavPageItem(obj)}
			    onArtboardItem={(obj)=> this.handleSideNavArtboardItem(obj)}
			    onSliceItem={(obj)=> this.handleSideNavSliceItem(obj)}
			    onInvite={()=> this.setState({ overlayAlert : 'invite' })}
			    onRegister={()=> this.setState({ overlayAlert: 'register' })}
			    onLogout={()=> this.handleLogout()}
		    />

		    <div className="content-wrapper" ref={wrapper}>
			    <Switch>
			      <Route exact path="/" render={()=> <HomePage uploadID={this.state.uploadID} pageID={this.state.pageID} onArtboardSelected={(obj)=> this.handleArtboardSelected(obj)} onArtboardClicked={(obj)=> this.handleArtboardDetails(obj)} />} />
				    <Route exact path="/doc/:uploadID/:docName" render={()=> <HomePage uploadID={this.state.uploadID} pageID={this.state.pageID} onArtboardSelected={(obj)=> this.handleArtboardSelected(obj)} onArtboardClicked={(obj)=> this.handleArtboardDetails(obj)} />} />
			      <Route exact path="/developer" component={DevelopersPage} />
			      <Route exact path="/mission" component={MissionPage} />
			      <Route exact path="/privacy" component={PrivacyPage} />
			      <Route path="/artboard/:uploadID/:pageID/:artboardID/:artboardSlug" component={InspectorPage} />
			      <Route exact path="/terms" component={TermsPage} />
			      <Route component={Status404Page} />
			    </Switch>
		    </div>

		    {(this.state.overlayAlert === 'register') && (
			    <RegisterOverlay onClick={(buttonType)=> this.handleOverlay('register', buttonType)} />
		    )}

		    {(this.state.overlayAlert === 'invite') && (
			    <InviteOverlay onClick={(buttonType)=> this.handleOverlay('invite', buttonType)} />
		    )}

		    {(this.state.overlayAlert === 'upload') && (
		    	<UploadOverlay onClick={(buttonType)=> this.handleOverlay('upload', buttonType)} />
		    )}

		    {(this.state.overlayAlert === 'download') && (
			    <StripeOverlay onClick={(buttonType)=> this.handleOverlay('download', buttonType)} />
		    )}
	    </div>
    );
  }
}

export default withRouter(App);
