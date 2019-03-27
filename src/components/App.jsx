
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import qs from 'qs';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import AdvertPanel from './elements/overlays/AdvertPanel';
import AlertDialog from './elements/overlays/AlertDialog/AlertDialog';
import BottomNav from './elements/navs/BottomNav';
import BaseOverlay from './elements/overlays/BaseOverlay/BaseOverlay';
import StripeModal from './elements/overlays/StripeModal';
import PopupNotification from './elements/overlays/PopupNotification';
import TopNav from './elements/navs/TopNav';
import HomePage from './pages/desktop/HomePage';
import InspectorPage from './pages/desktop/InspectorPage';
import IntegrationsPage from './pages/desktop/IntegrationsPage';
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

import { EXTENSION_PUBLIC_HOST, API_ENDPT_URL } from '../consts/uris';
import {
	appendHomeArtboards,
	fetchUserHistory,
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
	isProfilePage,
	isUploadPage, isUserLoggedIn
} from '../utils/funcs';
import { Browsers, URLs } from '../utils/lang';
import { initTracker, trackEvent, trackPageview } from '../utils/tracking';
import adBannerPanel from '../assets/json/ad-banner-panel';

const wrapper = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		deeplink  : state.deeplink,
		profile   : state.userProfile,
		artboards : state.homeArtboards
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		purgeHomeArtboards  : ()=> dispatch(appendHomeArtboards(null)),
		fetchUserHistory    : (payload)=> dispatch(fetchUserHistory(payload)),
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
			contentSize   : {
				width  : 0,
				height : 0
			},
			mobileOverlay : true,
			rating        : 0,
			processing    : false,
			popup         : null,
			payDialog     : false,
			stripeOverlay : false
// 			stripeOverlay : true
		};
	}

	componentDidMount() {
		console.log('App.componentDidMount()', this.props, this.state);

		if (typeof cookie.load('user_id') === 'undefined') {
			cookie.save('user_id', '0', { path : '/' });
		}

		initTracker(cookie.load('user_id'));
		trackEvent('site', 'load');
		trackPageview();

		this.extensionCheck();
		this.props.updateDeeplink(idsFromPath());


		if (isHomePage()) {
			this.handlePage('inspect');

		} else if (isUploadPage(true)) {
			this.handlePage('new/inspect');

		} else if (isInspectorPage()) {
// 			if (typeof cookie.load('tutorial') === 'undefined') {
// 				cookie.save('tutorial', '0', { path : '/' });
// 			}

		} else if (isProfilePage(true) && !isUserLoggedIn()) {
			this.handlePage('login');
		}

		cookie.save('tutorial', '1', { path : '/' });

		window.addEventListener('resize', this.handleResize);
		window.onpopstate = (event)=> {
// 			console.log('-/\\/\\/\\/\\/\\/\\-', 'window.onpopstate()', '-/\\/\\/\\/\\/\\/\\-', event);
// 			this.handlePage('<<');
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('App.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { profile, artboards, deeplink } = this.props;
		const { payDialog, stripeOverlay } = this.state;

		if (profile) {
			if (!prevProps.profile) {
				this.props.fetchUserHistory({profile});

				if (this.state.ranking !== 0) {
					this.setState({ rating : 0 });
				}
			}

			console.log('[:::::::::::|:|:::::::::::] PAY CHECK [:::::::::::|:|:::::::::::]');
			console.log('[::] (!payDialog && !stripeOverlay)', (!payDialog && !stripeOverlay));
			console.log('[::] (!profile.paid && artboards.length > 3)', (!profile.paid && artboards.length > 3));
			console.log('[::] (isHomePage(false)', isHomePage(false));
			console.log('[::] (isInspectorPage())', isInspectorPage());
			console.log('[::] (prevProps.deeplink.uploadID)', prevProps.deeplink.uploadID);
			console.log('[::] (this.props.deeplink.uploadID)', deeplink.uploadID);
			console.log('[:::::::::::|:|:::::::::::] =-=-=-=-= [:::::::::::|:|:::::::::::]');

			//console.log('||||||||||||||||', payDialog, stripeOverlay, profile.paid, artboards.length, isHomePage(false), prevProps.deeplink.uploadID, deeplink.uploadID, isInspectorPage());
			if ((!payDialog && !stripeOverlay) && (!profile.paid && artboards.length > 3) && ((isHomePage(false) && prevProps.deeplink.uploadID !== deeplink.uploadID) || (isInspectorPage() && prevProps.uploadID !== deeplink.uploadID))) {
				this.setState({ payDialog : true });
			}

			if (payDialog && profile.paid) {
				this.setState({ payDialog : false });
			}
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
		img.src = `${EXTENSION_PUBLIC_HOST}/images/pixel.png`;
		img.onload = ()=> { this.props.setAtomExtension(true); };
		img.onerror = ()=> { this.props.setAtomExtension(false); };
	};

	handleArtboardClicked = (artboard)=> {
// 		console.log('App.handleArtboardClicked()', artboard);

		const { profile, artboards } = this.props;
		if (!profile.paid && artboards.length > 3) {
			this.props.updateDeeplink(null);
// 			this.setState({ payDialog : true });

		} else {
			this.onAddUploadView(artboard.uploadID);
			if (typeof cookie.load('tutorial') === 'undefined') {
				cookie.save('tutorial', '0', { path : '/' });
			}

			this.handlePage(buildInspectorPath({
				id    : artboard.uploadID,
				title : artboard.title
				}, URLs.firstComponent()
			));

			Browsers.scrollOrigin(wrapper.current);
		}

		this.props.updateDeeplink({
			uploadID   : artboard.uploadID,
			pageID     : artboard.pageID,
			artboardID : artboard.id
		});
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
		this.props.purgeHomeArtboards();
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

	handlePaidAlert = ()=> {
		this.setState({
			payDialog     : false,
			stripeOverlay : true
		});
	};

	handlePurchaseCancel = ()=> {
// 		console.log('App.handlePurchaseCancel()');

		if (isInspectorPage()) {
			this.handlePage('');
		}

		setTimeout(()=> {
			this.setState({
				payDialog     : false,
				stripeOverlay : false
			});
		}, (isInspectorPage()) ? 666 : 0);
	};

	handlePurchaseSuccess = (purchase)=> {
// 		console.log('App.handlePurchaseSucess()', purchase);

		this.setState({
			payDialog     : false,
			stripeOverlay : false
		});
		this.props.fetchUserProfile();
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

		this.setState({ contentSize : {
			width  : wrapper.current.innerWidth,
			height : 	wrapper.current.innerHeight
		} })
	};

	handleScrollOrigin = ()=> {
// 		console.log('App.handleScrollOrigin()');
		Browsers.scrollOrigin(wrapper.current);
	};

	handleScore = (score)=> {
// 		console.log('App.handleScore()', score);
		this.setState({ rating : score });
		this.handlePage('rate-this');
	};

	onAddUploadView = (uploadID)=> {
		axios.post(API_ENDPT_URL, qs.stringify({
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

		const { profile } = this.props;
  	const { uploadID } = this.props.deeplink;
		const { pathname } = this.props.location;
  	const { rating, mobileOverlay, processing, popup, stripeOverlay, payDialog } = this.state;
//   	const { rating, mobileOverlay, popup, stripeOverlay, payDialog } = this.state;
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
					    <Route exact path="/inspect" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} onStripeOverlay={()=> this.setState({ stripeOverlay : true })} />} />
					    <Route path="/inspect/:uploadID/:uploadSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/login/:inviteID?" render={(props)=> <LoginPage {...props} onPage={this.handlePage} />} onPopup={this.handlePopup} />
					    <Route path="/new/:type?" render={(props)=> <UploadPage {...props} onPage={this.handlePage} onPopup={this.handlePopup} onProcessing={this.handleProcessing} onScrollOrigin={this.handleScrollOrigin} onStripeOverlay={()=> this.setState({ stripeOverlay : true })} />} />
					    <Route exact path="/parts" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} onStripeOverlay={()=> this.setState({ stripeOverlay : true })} />} />
					    <Route exact path="/integrations" render={()=> <IntegrationsPage onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/parts/:uploadID/:uploadSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/privacy" render={()=> <PrivacyPage />} />
					    <Route exact path="/present" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} onStripeOverlay={()=> this.setState({ stripeOverlay : true })} />} />
					    <Route path="/present/:uploadID/:uploadSlug" render={(props)=> <InspectorPage {...props} processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/profile" render={()=> <ProfilePage onPage={this.handlePage} onStripeOverlay={()=> this.setState({ stripeOverlay : true })} onPopup={this.handlePopup} />} />
					    <Route path="/profile/:username?" render={(props)=> <ProfilePage {...props} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/rate-this" render={()=> <RateThisPage score={rating} onPage={this.handlePage} />} />
					    <Route path="/recover/:userID?" render={(props)=> <RecoverPage {...props} onLogout={this.handleLogout} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/register/:inviteID?" render={(props)=> <RegisterPage {...props} onPage={this.handlePage} />} onPopup={this.handlePopup} />
					    <Route exact path="/terms" render={()=> <TermsPage />} />
				      <Route render={()=> <Status404Page onPage={this.handlePage} />} />
				    </Switch>

				    {(!isInspectorPage()) && (<AdvertPanel title={adBannerPanel.title} image={adBannerPanel.image} onClick={()=> this.handleAdBanner(adBannerPanel.url)} />)}
				    {(!isInspectorPage()) && (<BottomNav mobileLayout={false} onLogout={()=> this.handleLogout()} onPage={this.handlePage} />)}
			    </div>

		      {!(/chrom(e|ium)/i.test(navigator.userAgent.toLowerCase())) && (<BaseOverlay
				    tracking="modal/site"
				    closeable={false}
				    onComplete={()=> null}>
				    This site best viewed in Chrome.
			    </BaseOverlay>)}

				  {(popup) && (
				  	<PopupNotification payload={popup} onComplete={()=> this.setState({ popup : null })}>
					    {popup.content}
			      </PopupNotification>
				  )}

				  {(payDialog) && (<AlertDialog
					  title="Limited Account"
					  message="You must upgrade to an unlimited account to view more than 3 projects."
					  onComplete={this.handlePaidAlert}
				  />)}

				  {(stripeOverlay && (profile && !profile.paid)) && (
				  	<StripeModal
						  profile={profile}
						  onPage={this.handlePage}
						  onPopup={this.handlePopup}
						  onPurchase={this.handlePurchaseSuccess}
						  onComplete={this.handlePurchaseCancel} />
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
