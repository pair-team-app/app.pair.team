
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import qs from 'qs';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import BottomNav from '../navs/BottomNav';
import TopNav from '../navs/TopNav';
import AdvertPanel from '../overlays/AdvertPanel';
import AlertDialog from '../overlays/AlertDialog/AlertDialog';
import BaseOverlay from '../overlays/BaseOverlay/BaseOverlay';
import PopupNotification, {POPUP_TYPE_OK} from '../overlays/PopupNotification';
// import GitHubModal from '../overlays/GitHubModal';
import ConfigUploadModal from '../overlays/ConfigUploadModal';
import LoginModal from '../overlays/LoginModal';
import RegisterModal from '../overlays/RegisterModal';
import IntegrationsModal from '../overlays/IntegrationsModal';
import StripeModal from '../overlays/StripeModal';
import HomePage from '../pages/desktop/HomePage';
import InspectorPage from '../pages/desktop/InspectorPage';
import IntegrationsPage from '../pages/desktop/IntegrationsPage';
// import InviteTeamPage from '../pages/desktop/InviteTeamPage';
// import LoginPage from '../pages/desktop/LoginPage';
import ProfilePage from '../pages/desktop/ProfilePage';
import PrivacyPage from '../pages/desktop/PrivacyPage';
import RateThisPage from '../pages/desktop/RateThisPage';
import RecoverPage from '../pages/desktop/RecoverPage';
// import RegisterPage from '../pages/desktop/RegisterPage';
// import Status404Page from '../pages/desktop/Status404Page';
import TermsPage from '../pages/desktop/TermsPage';
import UploadPage from '../pages/desktop/UploadPage';
import BaseMobilePage from '../pages/mobile/BaseMobilePage';


import { EXTENSION_PUBLIC_HOST, API_ENDPT_URL } from '../../consts/uris';
import {
	appendHomeArtboards,
	fetchUserHistory,
	fetchUserProfile,
	setAtomExtension,
	updateDeeplink,
	updateUserProfile
} from '../../redux/actions';
import {
	buildInspectorPath,
// 	getRouteParams,
	idsFromPath,
	isHomePage,
	isInspectorPage,
	isProfilePage,
	isUserLoggedIn
} from '../../utils/funcs';
import { Browsers, URLs } from '../../utils/lang';
import { initTracker, trackEvent, trackPageview } from '../../utils/tracking';
import adBannerPanel from '../../assets/json/ad-banner-panel';


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
		purgeHomeArtboards : ()=> dispatch(appendHomeArtboards(null)),
		fetchUserHistory   : (payload)=> dispatch(fetchUserHistory(payload)),
		fetchUserProfile   : ()=> dispatch(fetchUserProfile()),
		updateDeeplink     : (navIDs)=> dispatch(updateDeeplink(navIDs)),
		updateUserProfile  : (profile)=> dispatch(updateUserProfile(profile)),
		setAtomExtension   : (installed)=> dispatch(setAtomExtension(installed))
	});
};


class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			contentSize       : {
				width  : 0,
				height : 0
			},
			rating            : 0,
			allowMobile       : true,
			processing        : false,
			popup             : null,
			loginModal        : false,
			registerModal     : false,
			githubModal       : false,
			integrationsModal : false,
			configUploadModal : false,
			payDialog         : false,
			stripeModal       : false
		};


		this.onCookieSetup('tutorial');
		initTracker(cookie.load('user_id'));
	}

	componentDidMount() {
		console.log('App.componentDidMount()', this.props, this.state);

		trackEvent('site', 'load');
		trackPageview();

// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (Strings.randHex())), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (parseInt(Maths.randomHex(), 16))), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (URLs.queryString()), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');


		this.onExtensionCheck();
		this.props.updateDeeplink(idsFromPath());

		window.addEventListener('resize', this.handleResize);
		window.onpopstate = (event)=> {
			console.log('-/\\/\\/\\/\\/\\/\\-', 'window.onpopstate()', '-/\\/\\/\\/\\/\\/\\-', event);
// 			this.handlePage('<<');
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('App.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { profile, artboards, deeplink } = this.props;
		const { pathname } = this.props.location;
		const { payDialog, stripeModal } = this.state;


		if (prevProps.pathname !== pathname) {
// 			console.log('|:|:|:|:|:|:|:|:|:|:|:|', getRouteParams(pathname));
		}

		if (profile) {
			if (!prevProps.profile) {
				this.props.fetchUserHistory({profile});

				if (this.state.ranking !== 0) {
					this.setState({ rating : 0 });
				}
			}

// 			console.log('[:::::::::::|:|:::::::::::] PAY CHECK [:::::::::::|:|:::::::::::]');
// 			console.log('[::] (!payDialog && !stripeModal)', (!payDialog && !stripeModal));
// 			console.log('[::] (!profile.paid && artboards.length > 3)', (!profile.paid && artboards.length > 3));
// 			console.log('[::] (isHomePage(false)', isHomePage(false));
// 			console.log('[::] (isInspectorPage())', isInspectorPage());
// 			console.log('[::] (prevProps.deeplink.uploadID)', prevProps.deeplink.uploadID);
// 			console.log('[::] (this.props.deeplink.uploadID)', deeplink.uploadID);
// 			console.log('[:::::::::::|:|:::::::::::] =-=-=-=-= [:::::::::::|:|:::::::::::]');

			//console.log('||||||||||||||||', payDialog, stripeModal, profile.paid, artboards.length, isHomePage(false), prevProps.deeplink.uploadID, deeplink.uploadID, isInspectorPage());
			if ((!payDialog && !stripeModal) && (!profile.paid && artboards.length > 3) && ((isHomePage(false) && prevProps.deeplink.uploadID !== deeplink.uploadID) || (isInspectorPage() && prevProps.uploadID !== deeplink.uploadID))) {
				this.setState({ payDialog : true });
			}

			if (payDialog && profile.paid) {
				this.setState({ payDialog : false });
			}

		} else {
// 			if (isUserLoggedIn()) {
// 				this.handleLogout();
// 			}
		}
	}

	componentWillUnmount() {
		console.log('App.componentWillUnmount()');

		window.onpopstate = null;
		window.removeEventListener('resize', this.handleResize);
	}


	handleArtboardClicked = (artboard)=> {
// 		console.log('App.handleArtboardClicked()', artboard);

		const { profile, artboards } = this.props;
		if (!profile.paid && artboards.length > 3) {
			this.props.updateDeeplink(null);
// 			this.setState({ payDialog : true });

		} else {
			this.onAddUploadView(artboard.uploadID);
			this.handlePage(buildInspectorPath({
				id    : artboard.uploadID,
				title : artboard.title
				}, URLs.firstComponent()
			));

			Browsers.scrollOrigin(wrapper.current);
		}

		const { uploadID, pageID } = artboard;
		const artboardID = artboard.id;
		this.props.updateDeeplink({ uploadID, pageID, artboardID });
	};

	handleAdBanner = (url)=> {
// 		console.log('App.handleAdBanner()', url);

		trackEvent('ad-banner', 'click');
		window.open(url);
	};

	handleGitHubSubmitted = (signup)=> {
		console.log('App.handleGitHubSubmitted()', signup);
		this.onHideModal('/github-connect');

		if (signup) {
			this.handleRegistered();
		}

		this.onShowModal('/config-upload');
	};

	handleIntegrationsSubmitted = ()=> {
// 		console.log('App.handleIntegrationsSubmitted()');

		this.onHideModal('/integrations');
		this.props.fetchUserProfile();

		if (isProfilePage()) {
			this.handlePopup({
				type    : POPUP_TYPE_OK,
				content : 'Profile updated.',
				delay   : 333
			});
		}
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
		url = ((!url) ? '' : url).replace(/^\/(.+)$/, '$1');

		const { pathname } = window.location;
		if (pathname.split('/')[1] !== url.split('/')[0]) {
			Browsers.scrollOrigin(wrapper.current);
		}

		if (url === '<<') {
			this.props.history.goBack();

		} else if (url === '') {
			trackPageview('/');

			this.props.updateDeeplink(null);
			this.props.history.push(`/`);

		} else {
			trackPageview(`/${url}`);
			this.props.history.push(`/${url}`);
		}
	};

	handlePaidAlert = ()=> {
// 		console.log('App.handlePaidAlert()');

		this.onShowModal('/stripe');
	};

	handlePopup = (payload)=> {
// 		console.log('App.handlePopup()', payload);
		this.setState({ popup : payload });
	};

	handleProcessing = (processing)=> {
		console.log('App.handleProcessing()', processing);
		this.setState({ processing });
	};

	handlePurchaseCancel = ()=> {
// 		console.log('App.handlePurchaseCancel()');

		if (isInspectorPage()) {
			this.handlePage('');
		}

		setTimeout(()=> {
			this.onHideModal('/stripe');
		}, (isInspectorPage()) ? 666 : 0);
	};

	handlePurchaseSubmitted = (purchase)=> {
// 		console.log('App.handlePurchaseSubmitted()', purchase);

		this.onHideModal('/stripe');
		this.props.fetchUserProfile();
	};

	handleRegistered = ()=> {
		console.log('App.handleRegistered()');

		setTimeout(()=> {
			this.onShowModal('/integrations');
		}, 1250);
	};

	handleResize = (event)=> {
// 		console.log('App.handleResize()', event);

		this.setState({ contentSize : {
			width  : wrapper.current.innerWidth,
			height : wrapper.current.innerHeight
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

	onCookieSetup = (key)=> {
// 		console.log('App.onCookieSetup()', key);

		if (key === 'tutorial') {
			if (typeof cookie.load('tutorial') === 'undefined') {
				cookie.save('tutorial', '0', { path : '/' });
			}
			cookie.save('tutorial', '1', { path : '/' });
		}
	};

	onExtensionCheck = ()=> {
// 		console.log('App.onExtensionCheck()');

		let img = new Image();
		img.src = `${EXTENSION_PUBLIC_HOST}/images/pixel.png`;
		img.onload = ()=> { this.props.setAtomExtension(true); };
		img.onerror = ()=> { this.props.setAtomExtension(false); };
	};

	onHideModal = (url)=> {
		console.log('App.onHideModal()', url);

		if (url === '/config-upload') {
			this.setState({ configUploadModal : false });

		} else if (url === '/github-connect') {
			this.setState({ githubModal : false });

		} else if (url === '/integrations') {
			this.setState({ integrationsModal : false });

		} else if (url === '/login') {
			this.setState({ loginModal : false });

		} else if (url === '/register') {
			this.setState({ registerModal : false });

		} else if (url === '/stripe') {
			this.setState({
				payDialog   : false,
				stripeModal : false
			});
		}
	};

	onShowModal = (url)=> {
		console.log('App.onShowModal()', url);

		this.setState({
			configUploadModal : false,
			githubModal       : false,
			integrationsModal : false,
			loginModal        : false,
			registerModal     : false,
			stripeModal       : false
		});

		if (url === '/config-upload') {
			this.setState({ configUploadModal : true });

		} else if (url === '/github-connect') {
			this.setState({
				registerModal : true,
				githubModal   : true
			});

		} else if (url === '/integrations') {
			this.setState({ integrationsModal : true });

		} else if (url === '/login') {
			this.setState({ loginModal : true });

		} else if (url === '/register') {
			this.setState({ registerModal : true });

		} else if (url === '/stripe') {
			this.setState({
				payDialog   : false,
				stripeModal : true
			});
		}
	};


	render() {
//   	console.log('App.render()', this.props, this.state);

		const { profile } = this.props;
		const { pathname } = this.props.location;
  	const { rating, allowMobile, processing, popup } = this.state;
  	const { integrationsModal, loginModal, registerModal, githubModal, configUploadModal, stripeModal, payDialog } = this.state;
//   	const processing = true;

  	return ((!Browsers.isMobile.ANY() || !allowMobile)
		  ? (<div className="desktop-site-wrapper">
			    <TopNav
				    mobileLayout={false}
				    pathname={pathname}
				    onModal={this.onShowModal}
				    onPage={this.handlePage}
				    onLogout={this.handleLogout}
				    onScore={this.handleScore}
			    />

			    <div className="content-wrapper" ref={wrapper}>
				    <Switch>
					    <Route exact path="/"><Redirect to="/inspect" /></Route>
					    <Route exact path="/invite-team"><Redirect to="/" /></Route>
					    <Route exact path="/new"><Redirect to="/new/inspect" /></Route>
					    {(!isUserLoggedIn()) && (<Route exact path="/profile"><Redirect to="/register" /></Route>)}

					    <Route exact path="/:section(inspect|parts|present)" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onGitHub={()=> this.onShowModal('/github-connect')} onPopup={this.handlePopup} />} />
					    <Route exact path="/new/:type(inspect|parts|present)" render={(props)=> <UploadPage { ...props } onPage={this.handlePage} onProcessing={this.handleProcessing} onScrollOrigin={this.handleScrollOrigin} onGitHub={()=> this.onShowModal('/github-connect')} onStripeModal={()=> this.onShowModal('/stripe')} onRegistered={this.handleRegistered} onPopup={this.handlePopup} />} />

					    {/*<Route path="/login/:inviteID?" render={(props)=> <LoginPage { ...props } onPage={this.handlePage} />} onPopup={this.handlePopup} />*/}
					    {/*<Route path="/register/:inviteID?" render={(props)=> <RegisterPage { ...props } onPage={this.handlePage} onRegistered={this.handleRegistered} onPopup={this.handlePopup} />} />*/}
					    <Route path="/recover/:userID?" render={(props)=> <RecoverPage { ...props } onLogout={this.handleLogout} onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route exact path="/:section(inspect|parts|present)/:uploadID/:titleSlug" render={(props)=> <InspectorPage { ...props } processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/profile/:username?" render={(props)=> <ProfilePage { ...props } onPage={this.handlePage} onStripeModal={()=> this.onShowModal('/stripe')} onIntegrations={()=> this.onShowModal('/integrations')} onPopup={this.handlePopup} />} />

					    <Route exact path="/integrations" render={()=> <IntegrationsPage onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/rate-this" render={()=> <RateThisPage score={rating} onPage={this.handlePage} />} />

					    <Route exact path="/privacy" render={()=> <PrivacyPage />} />
					    <Route exact path="/terms" render={()=> <TermsPage />} />
					    {/*<Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={this.handlePage} onPopup={this.handlePopup} />} />*/}

					    {/*<Route render={()=> <Status404Page onPage={this.handlePage} />} />*/}
					    <Route><Redirect to="/" /></Route>
				    </Switch>

				    {(!isInspectorPage()) && (<AdvertPanel
					    title={adBannerPanel.title} image={adBannerPanel.image}
					    onClick={()=> this.handleAdBanner(adBannerPanel.url)}
				    />)}

				    {(!isInspectorPage()) && (<BottomNav
					    mobileLayout={false}
					    onLogout={()=> this.handleLogout()}
					    onModal={this.onShowModal}
					    onPage={this.handlePage}
				    />)}
			    </div>

				  {!(/chrom(e|ium)/i.test(navigator.userAgent.toLowerCase()))
				    ? (<BaseOverlay
							  tracking="modal/site"
							  closeable={false}
							  onComplete={()=> null}>
							  This site best viewed in Chrome.
						  </BaseOverlay>)
					  : (<>
							  {(popup) && (<PopupNotification payload={popup} onComplete={()=> this.setState({ popup : null })}>
								  {popup.content}
							  </PopupNotification>)}

							  {(configUploadModal) && (<ConfigUploadModal
								  onPage={this.handlePage}
								  onPopup={this.handlePopup}
								  onComplete={()=> this.onHideModal('/config-upload')}
								  onSubmitted={()=> this.onHideModal('/config-upload')}
							  />)}

							  {(loginModal) && (<LoginModal
								  inviteID={null}
								  onPage={this.handlePage}
								  onPopup={this.handlePopup}
								  onComplete={()=> this.onHideModal('/login')}
							  />)}

							  {(registerModal) && (<RegisterModal
								  openAuth={githubModal}
								  onModal={this.onShowModal}
								  onPage={this.handlePage}
								  onPopup={this.handlePopup}
								  onComplete={()=> this.onHideModal('/register')}
								  onRegistered={this.handleRegistered}
							  />)}

							  {(integrationsModal) && (<IntegrationsModal
								  profile={profile}
								  onPopup={this.handlePopup}
								  onComplete={()=> this.onHideModal('/integrations')}
								  onSubmitted={this.handleIntegrationsSubmitted}
							  />)}

							  {(payDialog) && (<AlertDialog
								  title="Limited Account"
								  message="You must upgrade to an unlimited account to view more than 3 projects."
								  onComplete={this.handlePaidAlert}
							  />)}

							  {(stripeModal) && (<StripeModal
								  profile={profile}
								  onPage={this.handlePage}
								  onPopup={this.handlePopup}
								  onSubmitted={this.handlePurchaseSubmitted}
								  onComplete={()=> this.onHideModal('/stripe')}
							  />)}
					  </>)
				  }
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
				    <BaseMobilePage
					    className={null}
					    onPage={this.handlePage} />

				    <BottomNav
					    mobileLayout={true}
					    onLogout={this.handleLogout}
					    onModal={this.onShowModal}
					    onPage={this.handlePage}
				    />
			    </div>
		    </div>)
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
