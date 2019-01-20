
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Route, Switch, withRouter } from 'react-router-dom'

import TopNav from './components/elements/TopNav';
import BottomNav from './components/elements/BottomNav';
import ContentModal from './components/elements/ContentModal';
import Popup from './components/elements/Popup';
import AddOnsPage from './components/pages/AddOnsPage';
import APIPage from './components/pages/APIPage';
import ExplorePage from './components/pages/ExplorePage';
import HomePage from './components/pages/HomePage';
import InspectorPage from './components/pages/InspectorPage';
import InviteTeamPage from './components/pages/InviteTeamPage';
import LoginPage from './components/pages/LoginPage';
import MissionPage from './components/pages/MissionPage';
import ProfilePage from './components/pages/ProfilePage';
import PrivacyPage from './components/pages/PrivacyPage';
import RateThisPage from './components/pages/RateThisPage';
import RecoverPage from './components/pages/RecoverPage';
import RegisterPage from './components/pages/RegisterPage';
import Status404Page from './components/pages/Status404Page';
import TermsPage from './components/pages/TermsPage';
import UploadPage from './components/pages/UploadPage';

import { fetchUserProfile, updateNavigation, updateUserProfile } from './redux/actions';
import {
	buildInspectorPath,
	buildProjectPath,
	idsFromPath,
	isHomePage,
	isInspectorPage,
	isUploadPage,
	scrollOrigin
} from './utils/funcs';
import { initTracker, trackEvent } from './utils/tracking';


const wrapper = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		navigation : state.navigation,
		profile    : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		fetchUserProfile  : ()=> dispatch(fetchUserProfile()),
		updateNavigation  : (navIDs)=> dispatch(updateNavigation(navIDs)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			rating        : 0,
			processing    : false,
			popup         : null,
			mobileOverlay : true
		};
	}

	componentDidMount() {
		if (typeof cookie.load('user_id') === 'undefined') {
			cookie.save('user_id', '0', { path : '/' });

		} else {
			this.props.fetchUserProfile();
		}

		initTracker(cookie.load('user_id'));
		trackEvent('site', 'load');

		if (isHomePage()) {
			this.handlePage('inspect');
		}

		if (isUploadPage(true)) {
			this.handlePage('new/inspect');
		}

		const { uploadID, pageID, artboardID, sliceID } = idsFromPath();
		this.props.updateNavigation({ uploadID, pageID, artboardID, sliceID });

		if (isInspectorPage()) {
			this.onAddUploadView(uploadID);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('App.componentDidUpdate()', prevProps, this.props, prevState);
	}

	handleArtboardClicked = (artboard)=> {
		console.log('App.handleArtboardClicked()', artboard);
		this.onAddUploadView(artboard.uploadID);

		this.handlePage(buildInspectorPath({ id : artboard.uploadID, title : artboard.title }).substring(1));
		this.props.updateNavigation({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});

		scrollOrigin(wrapper.current);
	};

	handleAddOns = ()=> {
		console.log('App.handleAddOns()');
	};

	handleLogout = ()=> {
		cookie.save('user_id', '0', { path : '/' });

		this.props.updateUserProfile(null);
		this.handlePage('');
	};

	handlePage = (url)=> {
		console.log('App.handlePage()', url);
		url = url.substring((url.charAt(0) === '/') ? 1 : 0);

		const { pathname } = window.location;

		if (pathname.split('/')[1] !== url.split('/')[0]) {
			scrollOrigin(wrapper.current);
		}

		if (url === '<<') {
			this.props.history.goBack();

		} else if (url === '') {
			this.props.updateNavigation({
				uploadID   : 0,
				pageID     : 0,
				artboardID : 0
			});

			this.handlePage('inspect');

		} else {
			this.props.history.push('/' + url);
		}
	};

	handlePopup = (payload)=> {
		console.log('App.handlePopup()', payload);
		this.setState({ popup : payload });
	};

	handleProcessing = (processing)=> {
		this.setState({ processing });
	};

	handleScore = (score)=> {
		console.log('App.handleScore()', score);
		this.setState({ rating : score });
		this.handlePage('rate-this');
	};

	handleSideNavUploadItem = (upload)=> {
		console.log('App.handleSideNavUploadItem()', upload);

		if (upload.selected && this.props.navigation.uploadID !== upload.id) {
			this.props.updateNavigation({
				uploadID   : upload.id,
				pageID     : 0,
				artboardID : 0
			});
		}

		if (upload.selected && !isInspectorPage()) {
			const orgPath = window.location.pathname.split('/').slice(1, 2).pop();
			const projPath = buildProjectPath(upload);

			scrollOrigin(wrapper.current);
			this.handlePage(projPath.replace(/^\/(\w+)\//, ((orgPath.length > 0) ? orgPath : 'proj') + '/'));
		}
	};

	handleSideNavCategoryItem = (category)=> {
		console.log('App.handleSideNavCategoryItem()', category);

		if (category.selected) {
			let formData = new FormData();
			formData.append('action', 'UPLOAD');
			formData.append('upload_id', this.props.navigation.uploadID);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPLOAD', response.data);
					const { upload } = response.data;

					if (!isInspectorPage()) {
						this.handlePage(buildProjectPath(upload) + '/' + category.title.toLowerCase());
					}
				}).catch((error) => {
			});
		}
	};

	handleSideNavPageItem = (page)=> {
		console.log('App.handleSideNavPageItem()', page);

		if (page.selected) {
			let formData = new FormData();
			formData.append('action', 'ARTBOARDS');
			formData.append('upload_id', this.props.navigation.uploadID);
			formData.append('page_id', page.id);
			formData.append('slices', '0');
			formData.append('offset', '0');
			formData.append('length', '1');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('ARTBOARDS', response.data);

					const artboard = response.data.artboards.pop();
					this.onAddUploadView(page.uploadID);
					this.handlePage(buildInspectorPath({ id : page.uploadID, title : artboard.title }));
					this.props.updateNavigation({
						uploadID   : page.uploadID,
						pageID     : page.id,
						artboardID : artboard.id
					});
				}).catch((error) => {
			});

		} else {
			this.props.updateNavigation({ pageID : 0 });
		}
	};

	handleSideNavContributorItem = (contributor)=> {
		console.log('App.handleSideNavContributorItem()', contributor);
	};

	handleSideNavArtboardItem = (artboard)=> {
		console.log('App.handleSideNavArtboardItem()', artboard);

		this.onAddUploadView(artboard.uploadID);
		this.handlePage(buildInspectorPath({ id : artboard.uploadID, title : artboard.title }));

		this.props.updateNavigation({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});
	};

	onAddUploadView = (uploadID)=> {
		let formData = new FormData();
		formData.append('action', 'ADD_VIEW');
		formData.append('upload_id', uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('ADD_VIEW', response.data);
			}).catch((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					console.log(error.response.data);
					console.log(error.response.status);
					console.log(error.response.headers);
				} else if (error.request) {
					// The request was made but no response was received
					// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
					// http.ClientRequest in node.js
					console.log(error.request);
				} else {
					// Something happened in setting up the request that triggered an Error
					console.log('Error', error.message);
				}
				console.log(error.config);
		});
	};


	render() {
  	console.log('App.render()', this.props, this.state);

  	const { uploadID } = this.props.navigation;
		const { pathname } = this.props.location;
  	const { rating, mobileOverlay, processing, popup } = this.state;

  	return (
    	<div className="site-wrapper">
		    {(/chrom(e|ium)/.test(navigator.userAgent.toLowerCase()))
			    ? (<div className="browser-wrapper">
					    <TopNav
						    pathname={pathname}
						    onPage={this.handlePage}
						    onLogout={this.handleLogout}
						    onScore={this.handleScore}
					    />

					    <div className="content-wrapper" ref={wrapper}>
						    <Switch>
							    <Route exact path="/" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
						      <Route exact path="/add-ons" render={()=> <AddOnsPage onPage={this.handlePage} />} />
						      <Route exact path="/api" render={()=> <APIPage onPage={this.handlePage} onLogout={this.handleLogout} onPopup={this.handlePopup} />} />
							    <Route exact path="/artboard/:uploadID/:pageID/:artboardID/:artboardSlug" render={(props)=> <InspectorPage {...props} onPage={this.handlePage} />} onPopup={this.handlePopup} />
							    <Route exact path="/explore" render={()=> <ExplorePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
							    <Route path="/explore/:uploadID/:uploadSlug" render={(props)=> <ExplorePage {...props} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
							    <Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={this.handlePage} onPopup={this.handlePopup} />} />
							    <Route exact path="/login" render={()=> <LoginPage onPage={this.handlePage} />} onPopup={this.handlePopup} />
						      <Route exact path="/mission" render={()=> <MissionPage />} />
							    <Route path="/new/:type?" render={(props)=> <UploadPage {...props} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onProcessing={this.handleProcessing} onPopup={this.handlePopup} />} />

							    <Route exact path="/inspect" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
							    <Route exact path="/parts" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
							    <Route exact path="/colors" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
							    <Route exact path="/typography" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />

							    <Route path="/inspect/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
							    <Route path="/parts/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
							    <Route path="/colors/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
							    <Route path="/typography/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />

							    <Route exact path="/page" render={()=> <InspectorPage onPage={this.handlePage} onPopup={this.handlePopup} />} />
							    <Route exact path="/page/:uploadID/:pageID/:artboardID/:artboardSlug" render={(props)=> <InspectorPage {...props} onPage={this.handlePage} onPopup={this.handlePopup} />} />
						      <Route exact path="/profile" render={()=> <ProfilePage onPage={this.handlePage} />} />
						      <Route exact path="/privacy" render={()=> <PrivacyPage />} />
							    <Route path="/proj/:uploadID/:uploadSlug" render={(props)=> <HomePage {...props} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} />} onPopup={this.handlePopup} />
							    <Route exact path="/rate-this" render={()=> <RateThisPage score={rating} onPage={this.handlePage} />} />
							    <Route exact path="/recover" render={()=> <RecoverPage onPage={this.handlePage} />} />
							    <Route exact path="/recover/password" render={()=> <RecoverPage onPage={this.handlePage} />} />
							    <Route exact path="/register" render={()=> <RegisterPage onPage={this.handlePage} />} onPopup={this.handlePopup} />
						      <Route exact path="/terms" render={()=> <TermsPage />} />
						      <Route render={()=> <Status404Page onPage={this.handlePage} />} />
						    </Switch>
						    {(!isInspectorPage()) && (<BottomNav viewHeight={(wrapper.current) ? wrapper.current.clientHeight : 0} onPage={this.handlePage} onLogout={()=> this.handleLogout()} />)}
					    </div>
				      <MediaQuery query="(max-width: 1024px)">
					      {(mobileOverlay) && (<ContentModal
						      closeable={true}
						      defaultButton="OK"
						      onComplete={()=> this.setState({ mobileOverlay : false })}>
						        Sorry Design Engine is not ready for Mobile, head to your nearest desktop.
					      </ContentModal>)}
				      </MediaQuery>
				    </div>)
			    : (<div className="unsupported-browser">
				      This site best viewed in Chrome.
			      </div>)}

		    {popup && (
			    <Popup payload={popup} onComplete={()=> this.setState({ popup : null })} />
			    )}
	    </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));


// this.props.onPage('page/1/2/4/account');