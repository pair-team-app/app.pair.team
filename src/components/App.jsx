
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import qs from 'qs';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import AdBannerPanel from './elements/AdBannerPanel';
import BottomNav from './elements/BottomNav';
import ContentModal, { MODAL_SIZE_AUTO } from './elements/ContentModal';
import Popup from './elements/Popup';
import TopNav from './elements/TopNav';
import HomePage from './pages/desktop/HomePage';
import InspectorPage from './pages/desktop/InspectorPage';
import InviteTeamPage from './pages/desktop/InviteTeamPage';
import LoginPage from './pages/desktop/LoginPage';
import ProfilePage from './pages/desktop/ProfilePage';
import PrivacyPage from './pages/desktop/PrivacyPage';
import RateThisPage from './pages/desktop/RateThisPage';
import RecoverPage from './pages/desktop/RecoverPage';
import RegisterPage from './pages/desktop/RegisterPage';
import Status404Page from './pages/desktop/Status404Page';
import TermsPage from './pages/desktop/TermsPage';
import UploadPage from './pages/desktop/UploadPage';
import BaseMobilePage from './pages/mobile/BaseMobilePage';

import adBannerPanel from '../assets/json/ad-banner-panel';
import { EXTENSION_PUBLIC_URL } from '../consts/uris';
import {
	appendHomeArtboards,
	fetchUserProfile,
	setAtomExtension,
	updateDeeplink,
	updateUserProfile
} from '../redux/actions';
import {
	buildInspectorPath,
	idsFromPath,
	isHomePage,
	isInspectorPage,
	isUploadPage } from '../utils/funcs';
import { Browsers } from '../utils/lang';
import { initTracker, trackEvent, trackPageview } from '../utils/tracking';


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
		updateUserProfile   : (profile)=> dispatch(updateUserProfile(profile)),
		setAtomExtension    : (installed)=> dispatch(setAtomExtension(installed))
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

		this.extensionCheck();

		cookie.save('tutorial', '1', { path : '/' });
		window.addEventListener('resize', this.handleResize);

		window.onpopstate = (event)=> {
			console.log('|||||||||||||||||-', 'window.onpopstate()', '-|||||||||||||||||', event);

			if (isHomePage(false)) {
				this.handlePage('<<');

			} else {
				const { uploadID, pageID, artboardID, sliceID } = idsFromPath();
				this.props.updateDeeplink({ uploadID, pageID, artboardID, sliceID });
			}
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('App.componentDidUpdate()', prevProps, this.props, prevState);

		if (!prevProps.profile && this.props.profile && this.state.ranking !== 0) {
			this.setState({ rating : 0 });
		}
	}

	componentWillUnmount() {
		console.log('App.componentWillUnmount()');

		window.onpopstate = null;
		window.removeEventListener('resize', this.handleResize);
	}


	extensionCheck = ()=> {
// 		console.log('App.extensionCheck()');

		let img = new Image();
		img.src = `${EXTENSION_PUBLIC_URL}/images/pixel.png`;
		img.onload = ()=> { this.props.setAtomExtension(true); };
		img.onerror = ()=> { this.props.setAtomExtension(false); };
	};

	handleArtboardClicked = (artboard)=> {
		console.log('App.handleArtboardClicked()', artboard);

		this.onAddUploadView(artboard.uploadID);
		if (typeof cookie.load('tutorial') === 'undefined') {
			cookie.save('tutorial', '0', { path : '/' });
		}

		this.handlePage(buildInspectorPath({ id : artboard.uploadID, title : artboard.title }, (window.location.pathname.includes('/inspect')) ? '/inspect' : (window.location.pathname.includes('/parts')) ? '/parts' : '/present'));
		this.props.updateDeeplink({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});

		Browsers.scrollOrigin(wrapper.current);
	};

	handleAdBanner = (url)=> {
// 		console.log('App.handleAdBanner()', url);

		trackEvent('ad-banner', 'click');
		window.open(url);
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
			Browsers.scrollOrigin(wrapper.current);
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
		console.log('App.handleProcessing()', processing);
		this.setState({ processing });
	};

	handleResize = (event)=> {
		console.log('App.handleResize()', event);
	};

	handleScrollOrigin = ()=> {
		console.log('App.handleScrollOrigin()');
		Browsers.scrollOrigin(wrapper.current);
	};

	handleScore = (score)=> {
		console.log('App.handleScore()', score);
		this.setState({ rating : score });
		this.handlePage('rate-this');
	};

	onAddUploadView = (uploadID)=> {
		axios.post('https://api.designengine.ai/system.php', qs.stringify({
			action    : 'ADD_VIEW',
			upload_id : uploadID
		})).then((response)=> {
			console.log('ADD_VIEW', response.data);

		}).catch((error)=> {
			console.log(error);

			if (axios.isCancel(error)) {
				console.log('Request canceled');
			}

			// request was made, server responded with a status code != 2xx
			if (error.response) {
				console.log(error.response.data, error.response.status, error.response.headers);

			// request was made, but no response was received
			} else if (error.request) {
				console.log(error.request);

			// something else happened that triggered an error
			} else {
				console.log('Error', error.message);
			}
		});
	};


	render() {
//   	console.log('App.render()', this.props, this.state);

  	const { uploadID } = this.props.deeplink;
		const { pathname } = this.props.location;
  	const { rating, mobileOverlay, processing, popup } = this.state;
//   	const { rating, mobileOverlay, popup } = this.state;
//   	const processing = true;

  	return ((!Browsers.isMobile.ANY())
		  ? (<div className="desktop-site-wrapper">
			    <TopNav
				    mobileLayout={false}
				    pathname={pathname}
				    onPage={this.handlePage}
				    onLogout={this.handleLogout}
				    onScore={this.handleScore}
			    />

			    <div className="content-wrapper" ref={wrapper}>
				    <Switch>
					    <Route exact path="/" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
					    <Route exact path="/inspect" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
					    <Route path="/inspect/:uploadID/:uploadSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/login/:inviteID?" render={(props)=> <LoginPage {...props} onPage={this.handlePage} />} onPopup={this.handlePopup} />
					    <Route path="/new/:type?" render={(props)=> <UploadPage {...props} onPage={this.handlePage} onPopup={this.handlePopup} onProcessing={this.handleProcessing} onScrollOrigin={this.handleScrollOrigin} />} />
					    <Route exact path="/parts" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
					    <Route path="/parts/:uploadID/:uploadSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/privacy" render={()=> <PrivacyPage />} />
					    <Route exact path="/present" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
					    <Route path="/present/:uploadID/:uploadSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/profile" render={()=> <ProfilePage onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/profile/:username?" render={(props)=> <ProfilePage {...props} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/rate-this" render={()=> <RateThisPage score={rating} onPage={this.handlePage} />} />
					    <Route path="/recover/:userID?" render={(props)=> <RecoverPage {...props} onLogout={this.handleLogout} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/register/:inviteID?" render={(props)=> <RegisterPage {...props} onPage={this.handlePage} />} onPopup={this.handlePopup} />
					    <Route exact path="/terms" render={()=> <TermsPage />} />
				      <Route render={()=> <Status404Page onPage={this.handlePage} />} />
				    </Switch>

				    {(!isInspectorPage()) && (<AdBannerPanel title={adBannerPanel.title} image={adBannerPanel.image} onClick={()=> this.handleAdBanner(adBannerPanel.url)} />)}
				    {(!isInspectorPage()) && (<BottomNav mobileLayout={false} onLogout={()=> this.handleLogout()} onPage={this.handlePage} />)}
			    </div>

		      {!(/chrom(e|ium)/i.test(navigator.userAgent.toLowerCase())) && (<ContentModal
			      size={MODAL_SIZE_AUTO}
				    tracking="modal/site"
				    closeable={false}
				    onComplete={()=> null}>
				    This site best viewed in Chrome.
			    </ContentModal>)}

				  {(popup) && (
				  	<Popup payload={popup} onComplete={()=> this.setState({ popup : null })}>
					    {popup.content}
			      </Popup>
				  )}
		    </div>)

		  : (<div className="mobile-site-wrapper">
				  <TopNav
					  mobileLayout={true}
					  pathname={pathname}
					  onPage={this.handlePage}
					  onLogout={this.handleLogout}
					  onScore={this.handleScore}
				  />

			    <div className="content-wrapper" ref={wrapper}>
				    {(mobileOverlay) && (<BaseMobilePage
					    className={null}
					    onPage={this.handlePage} />)
				    }

				    <BottomNav mobileLayout={true} onLogout={()=> this.handleLogout()} onPage={this.handlePage} />
			    </div>
		    </div>)
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
