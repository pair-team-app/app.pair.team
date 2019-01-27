
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Route, Switch, withRouter } from 'react-router-dom';

import TopNav from './components/elements/TopNav';
import BottomNav from './components/elements/BottomNav';
import ContentModal, { MODAL_SIZE_FIXED } from './components/elements/ContentModal';
import Popup from './components/elements/Popup';
import HomePage from './components/pages/HomePage';
import InspectorPage from './components/pages/InspectorPage';
import InviteTeamPage from './components/pages/InviteTeamPage';
import LoginPage from './components/pages/LoginPage';
import ProfilePage from './components/pages/ProfilePage';
import PrivacyPage from './components/pages/PrivacyPage';
import RateThisPage from './components/pages/RateThisPage';
import RecoverPage from './components/pages/RecoverPage';
import RegisterPage from './components/pages/RegisterPage';
import Status404Page from './components/pages/Status404Page';
import TermsPage from './components/pages/TermsPage';
import UploadPage from './components/pages/UploadPage';

import {
	appendHomeArtboards,
	fetchUserProfile,
	updateDeeplink,
	updateUserProfile
} from './redux/actions';
import {
	buildInspectorPath,
	idsFromPath,
	isHomePage,
	isInspectorPage,
	isUploadPage,
	scrollOrigin
} from './utils/funcs';
import { initTracker, trackEvent, trackPageview } from './utils/tracking';


const wrapper = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		deeplink : state.deeplink,
		profile  : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		appendHomeArtboards : ()=> dispatch(appendHomeArtboards(null)),
		fetchUserProfile    : ()=> dispatch(fetchUserProfile()),
		updateDeeplink      : (navIDs)=> dispatch(updateDeeplink(navIDs)),
		updateUserProfile   : (profile)=> dispatch(updateUserProfile(profile))
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

// 		const { pathname } = window.location;

		initTracker(cookie.load('user_id'));
		trackEvent('site', 'load');
		trackPageview();

		if (isHomePage()) {
			this.handlePage('inspect');
		}

		if (isUploadPage(true)) {
			this.handlePage('new/inspect');
		}

		const { uploadID, pageID, artboardID, sliceID } = idsFromPath();
		this.props.updateDeeplink({ uploadID, pageID, artboardID, sliceID });

		if (isInspectorPage()) {
			if (typeof cookie.load('tutorial') === 'undefined') {
				cookie.save('tutorial', '0', { path : '/' });
			}

			this.onAddUploadView(uploadID);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('App.componentDidUpdate()', prevProps, this.props, prevState);
	}

	handleArtboardClicked = (artboard)=> {
		console.log('App.handleArtboardClicked()', artboard);
		this.onAddUploadView(artboard.uploadID);
		if (typeof cookie.load('tutorial') === 'undefined') {
			cookie.save('tutorial', '0', { path : '/' });
		}

		this.handlePage(buildInspectorPath({ id : artboard.uploadID, title : artboard.title }));
		this.props.updateDeeplink({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});

		scrollOrigin(wrapper.current);
	};

	handleLogout = ()=> {
		cookie.save('user_id', '0', { path : '/' });
		trackEvent('user', 'sign-out');
		this.props.updateUserProfile(null);
		this.props.appendHomeArtboards();
		this.handlePage('');
	};

	handlePage = (url)=> {
		console.log('App.handlePage()', url);
		url = url.replace(/^\/(.+)$/, '$1');

		const { pathname } = window.location;
		if (pathname.split('/')[1] !== url.split('/')[0]) {
			scrollOrigin(wrapper.current);
		}

		if (url === '<<') {
			this.props.history.goBack();

		} else if (url === '') {
			trackPageview('/');

			this.props.updateDeeplink(null);
			this.handlePage('inspect');

		} else {
			trackPageview(`/${url}`);
			this.props.history.push(`/${url}`);
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

  	const { uploadID } = this.props.deeplink;
		const { pathname } = this.props.location;
  	const { rating, mobileOverlay, processing, popup } = this.state;

  	return (
    	<div className="site-wrapper">
		    <TopNav
			    pathname={pathname}
			    onPage={this.handlePage}
			    onLogout={this.handleLogout}
			    onScore={this.handleScore}
		    />

		    <div className="content-wrapper" ref={wrapper}>
			    <Switch>
				    <Route exact path="/" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
				    <Route exact path="/colors" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
				    <Route path="/colors/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
				    <Route exact path="/inspect" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
				    <Route path="/inspect/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
				    <Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={this.handlePage} onPopup={this.handlePopup} />} />
				    <Route path="/login/:inviteID?" render={(props)=> <LoginPage {...props} onPage={this.handlePage} />} onPopup={this.handlePopup} />
				    <Route path="/new/:type?" render={(props)=> <UploadPage {...props} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onProcessing={this.handleProcessing} onPopup={this.handlePopup} />} />
				    <Route exact path="/parts" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
				    <Route path="/parts/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
				    <Route exact path="/privacy" render={()=> <PrivacyPage />} />
				    <Route exact path="/profile" render={()=> <ProfilePage onPage={this.handlePage} onPopup={this.handlePopup} />} />
				    <Route path="/profile/:username?" render={(props)=> <ProfilePage {...props} onPage={this.handlePage} onPopup={this.handlePopup} />} />
				    <Route exact path="/rate-this" render={()=> <RateThisPage score={rating} onPage={this.handlePage} />} />
				    <Route exact path="/recover" render={()=> <RecoverPage onPage={this.handlePage} />} />
				    <Route exact path="/recover/password" render={()=> <RecoverPage onPage={this.handlePage} />} />
				    <Route path="/register/:inviteID?" render={(props)=> <RegisterPage {...props} onPage={this.handlePage} />} onPopup={this.handlePopup} />
				    <Route exact path="/terms" render={()=> <TermsPage />} />
				    <Route exact path="/typography" render={()=> <HomePage path={pathname} onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
				    <Route path="/typography/:uploadID/:artboardSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
			      <Route render={()=> <Status404Page onPage={this.handlePage} />} />
			    </Switch>
			    {(!isInspectorPage()) && (<BottomNav viewHeight={(wrapper.current) ? wrapper.current.clientHeight : 0} onPage={this.handlePage} onLogout={()=> this.handleLogout()} />)}
		    </div>

	      <MediaQuery query="(max-width: 1024px)">
		      {(mobileOverlay) && (<ContentModal
			      tracking="modal/site"
			      size={MODAL_SIZE_FIXED}
			      closeable={true}
			      defaultButton="OK"
			      onComplete={()=> this.setState({ mobileOverlay : false })}>
			        Sorry Design Engine is not ready for Mobile, head to your nearest desktop.
		      </ContentModal>)}
	      </MediaQuery>

		    {!(/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())) && (<ContentModal
			    tracking="modal/site"
			    closeable={false}
			    onComplete={()=> null}>
			    This site best viewed in Chrome.
		    </ContentModal>)}

		    {popup && (<Popup payload={popup} onComplete={()=> this.setState({ popup : null })} />)}
	    </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
