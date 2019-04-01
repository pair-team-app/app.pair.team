
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
import GitHubModal from '../overlays/GitHubModal';
import IntegrationsModal from '../overlays/IntegrationsModal';
import StripeModal from '../overlays/StripeModal';
import HomePage from '../pages/desktop/HomePage';
import InspectorPage from '../pages/desktop/InspectorPage';
import IntegrationsPage from '../pages/desktop/IntegrationsPage';
import InviteTeamPage from '../pages/desktop/InviteTeamPage';
import LoginPage from '../pages/desktop/LoginPage';
import ProfilePage from '../pages/desktop/ProfilePage';
import PrivacyPage from '../pages/desktop/PrivacyPage';
import RateThisPage from '../pages/desktop/RateThisPage';
import RecoverPage from '../pages/desktop/RecoverPage';
import RegisterPage from '../pages/desktop/RegisterPage';
import Status404Page from '../pages/desktop/Status404Page';
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
	getRouteParams,
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
			githubModal       : false,
			integrationsModal : false,
			payDialog         : false,
			stripeModal       : false
		};


		this.cookieSetup('tutorial');
// 		this.cookieSetup('user_id');



		initTracker(cookie.load('user_id'));
	}

	componentDidMount() {
		console.log('App.componentDidMount()', this.props, this.state);

		trackEvent('site', 'load');
		trackPageview();

// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', Maths.factorial(5), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');

		this.extensionCheck();
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
			console.log('|:|:|:|:|:|:|:|:|:|:|:|', getRouteParams(pathname));
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
		}
	}

	componentWillUnmount() {
		console.log('App.componentWillUnmount()');

		window.onpopstate = null;
		window.removeEventListener('resize', this.handleResize);
	}


	cookieSetup = (key)=> {
		console.log('App.cookieSetup()', key);

		if (key === 'tutorial') {
			if (typeof cookie.load('tutorial') === 'undefined') {
				cookie.save('tutorial', '0', { path : '/' });
			}
			cookie.save('tutorial', '1', { path : '/' });
		}
	};

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

// 		this.props.updateDeeplink({
// 			uploadID   : artboard.uploadID,
// 			pageID     : artboard.pageID,
// 			artboardID : artboard.id
// 		});
	};

	handleAdBanner = (url)=> {
// 		console.log('App.handleAdBanner()', url);

		trackEvent('ad-banner', 'click');
		window.open(url);
	};

	handleGitHubSubmitted = ()=> {
		console.log('App.handleGitHubSubmitted()');
		this.onHideGitHubModal();
	};

	handleIntegrationsSubmitted = ()=> {
// 		console.log('App.handleIntegrationsSubmitted()');

		this.onHideIntegrationsModal();
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
// 		console.log('App.handlePaidAlert()');

		this.setState({
			payDialog   : false,
			stripeModal : true
		});
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
			this.onHideStripeModal();
		}, (isInspectorPage()) ? 666 : 0);
	};

	handlePurchaseSubmitted = (purchase)=> {
// 		console.log('App.handlePurchaseSubmitted()', purchase);

		this.onHideStripeModal();
		this.props.fetchUserProfile();
	};

	handleRegistered = ()=> {
		console.log('App.handleRegistered()');

		setTimeout(()=> {
			this.setState({ integrationsModal : true });
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

	onHideGitHubModal = ()=> {
		console.log('App.onHideGitHubModal()');
		this.setState({ githubModal : false });
	};

	onHideIntegrationsModal = ()=> {
		console.log('App.onHideIntegrationsModal()');
		this.setState({ integrationsModal : false });
	};

	onHideStripeModal = ()=> {
		console.log('App.onHideStripeModal()');

		this.setState({
			payDialog   : false,
			stripeModal : false
		});
	};


	render() {
//   	console.log('App.render()', this.props, this.state);

		const { profile } = this.props;
  	const { uploadID } = this.props.deeplink;
		const { pathname } = this.props.location;
  	const { rating, allowMobile, processing, popup } = this.state;
  	const { integrationsModal, githubModal, stripeModal, payDialog } = this.state;
//   	const processing = true;

  	return ((!Browsers.isMobile.ANY() || !allowMobile)
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
					    {/*<Route exact path="/" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />*/}
					    <Route exact path="/"><Redirect to="/inspect" /></Route>
					    <Route exact path="/new"><Redirect to="/new/inspect" /></Route>
					    <Route exact path="/profile">{(!isUserLoggedIn()) && (<Redirect to="/register" />)}</Route>

					    <Route exact path="/inspect" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
					    <Route exact path="/parts" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />
					    <Route exact path="/present" render={()=> <HomePage onPage={this.handlePage} onArtboardClicked={this.handleArtboardClicked} onPopup={this.handlePopup} />} />

					    <Route path="/inspect/:uploadID/:titleSlug" render={(props)=> <InspectorPage { ...props } processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/parts/:uploadID/:titleSlug" render={(props)=> <InspectorPage { ...props } processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route path="/present/:uploadID/:titleSlug" render={(props)=> <InspectorPage { ...props } processing={processing} onProcessing={this.handleProcessing} onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route path="/new/:type?" render={(props)=> <UploadPage { ...props } onPage={this.handlePage} onProcessing={this.handleProcessing} onScrollOrigin={this.handleScrollOrigin} onStripeModal={()=> this.setState({ stripeModal : true })} onRegistered={this.handleRegistered} onPopup={this.handlePopup} />} />
					    <Route path="/login/:inviteID?" render={(props)=> <LoginPage { ...props } onPage={this.handlePage} />} onPopup={this.handlePopup} />
					    <Route path="/register/:inviteID?" render={(props)=> <RegisterPage { ...props } onPage={this.handlePage} onRegistered={this.handleRegistered} onPopup={this.handlePopup} />} />
					    <Route path="/recover/:userID?" render={(props)=> <RecoverPage { ...props } onLogout={this.handleLogout} onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route exact path="/profile" render={()=> <ProfilePage onPage={this.handlePage} onStripeModal={()=> this.setState({ stripeModal : true })} onIntegrations={()=> this.setState({ integrationsModal : true })} onPopup={this.handlePopup} />} />
					    <Route path="/profile/:username?" render={(props)=> <ProfilePage { ...props } onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route exact path="/integrations" render={()=> <IntegrationsPage onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/rate-this" render={()=> <RateThisPage score={rating} onPage={this.handlePage} />} />

					    <Route exact path="/privacy" render={()=> <PrivacyPage />} />
					    <Route exact path="/terms" render={()=> <TermsPage />} />
					    <Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route render={()=> <Status404Page onPage={this.handlePage} />} />
				    </Switch>

				    {(!isInspectorPage()) && (<AdvertPanel title={adBannerPanel.title} image={adBannerPanel.image} onClick={()=> this.handleAdBanner(adBannerPanel.url)} />)}
				    {(!isInspectorPage()) && (<BottomNav mobileLayout={false} onLogout={()=> this.handleLogout()} onPage={this.handlePage} />)}
			    </div>


		      {(popup) && (<PopupNotification payload={popup} onComplete={()=> this.setState({ popup : null })}>
				    {popup.content}
		      </PopupNotification>)}

				  {(githubModal) && (<GitHubModal
					  profile={profile}
					  onPopup={this.handlePopup}
					  onComplete={this.onHideGitHubModal}
					  onSubmitted={this.handleGitHubSubmitted}
				  />)}

				  {(integrationsModal) && (<IntegrationsModal
					  profile={profile}
					  onPopup={this.handlePopup}
					  onComplete={this.onHideIntegrationsModal}
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
					  onComplete={this.handlePurchaseCancel}
					  />)}

				  {!(/chrom(e|ium)/i.test(navigator.userAgent.toLowerCase())) && (<BaseOverlay
					  tracking="modal/site"
					  closeable={false}
					  onComplete={()=> null}>
					  This site best viewed in Chrome.
				  </BaseOverlay>)}
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

				    <BottomNav mobileLayout={true} onLogout={()=> this.handleLogout()} onPage={this.handlePage} />
			    </div>
		    </div>)
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
