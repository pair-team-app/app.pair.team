
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import qs from 'qs';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import BottomNav from '../navs/BottomNav';
import TopNav from '../navs/TopNav';
import AlertDialog from '../overlays/AlertDialog';
import ConfirmDialog from '../overlays/ConfirmDialog';
import BaseOverlay from '../overlays/BaseOverlay';
import ConfigUploadModal from '../overlays/ConfigUploadModal';
import IntegrationsModal from '../overlays/IntegrationsModal';
import LoginModal from '../overlays/LoginModal';
import PopupNotification, { POPUP_TYPE_OK } from '../overlays/PopupNotification';
import RegisterModal from '../overlays/RegisterModal';
import StripeModal from '../overlays/StripeModal';
import HomePage from '../pages/desktop/HomePage';
import InspectorPage from '../pages/desktop/InspectorPage';
import IntegrationsPage from '../pages/desktop/IntegrationsPage';
import ProfilePage from '../pages/desktop/ProfilePage';
import PrivacyPage from '../pages/desktop/PrivacyPage';
import RecoverPage from '../pages/desktop/RecoverPage';
import SignupPage from '../pages/desktop/SignupPage';
import Status404Page from '../pages/desktop/Status404Page';
import TeamPage from '../pages/desktop/TeamPage';
import TermsPage from '../pages/desktop/TermsPage';
import UploadPage from '../pages/desktop/UploadPage';
import BaseMobilePage from '../pages/mobile/BaseMobilePage';

import {
	API_ENDPT_URL,
	EXTENSION_PUBLIC_HOST,
	GITHUB_APP_AUTH,
	Modals } from '../../consts/uris';
import {
	appendHomeArtboards,
	fetchTeamLookup,
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
import { Browsers, DateTimes, Strings, URIs } from '../../utils/lang';
import { initTracker, trackEvent, trackPageview } from '../../utils/tracking';
import freeAccount from '../../assets/json/free-account';


const wrapper = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		deeplink  : state.deeplink,
		profile   : state.userProfile,
		artboards : state.homeArtboards,
		team      : state.team
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		purgeHomeArtboards : ()=> dispatch(appendHomeArtboards(null)),
		fetchTeamLookup    : (payload)=> dispatch(fetchTeamLookup(payload)),
		fetchUserHistory   : (payload)=> dispatch(fetchUserHistory(payload)),
		fetchUserProfile   : ()=> dispatch(fetchUserProfile()),
		updateDeeplink     : (navIDs)=> dispatch(updateDeeplink(navIDs)),
		updateUserProfile  : (profile, force=true)=> dispatch(updateUserProfile(profile, force)),
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
			stripeModal       : false,
			teamDialog        : false,
			authID            : 0
		};

		this.githubWindow = null;
		this.authInterval = null;


		this.onCookieSetup('tutorial');
		initTracker(cookie.load('user_id'));
	}

	componentDidMount() {
		console.log('App.componentDidMount()', this.props, this.state);

		trackEvent('site', 'load');
		trackPageview();

// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (Strings.randHex())), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (parseInt(Maths.randomHex(), 16))), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (URIs.queryString()), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');


		//this.onExtensionCheck();
		this.props.updateDeeplink(idsFromPath());

		if (URIs.subdomain()) {
			this.props.fetchTeamLookup();
		}

		window.addEventListener('resize', this.handleResize);
		window.onpopstate = (event)=> {
			console.log('-/\\/\\/\\/\\/\\/\\-', 'window.onpopstate()', '-/\\/\\/\\/\\/\\/\\-', event);

			this.props.updateDeeplink(idsFromPath());
// 			this.handlePage('<<');
// 			this.handlePage(event.target.location.pathname, false);
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('App.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { profile, artboards, deeplink, team } = this.props;
		const { pathname } = this.props.location;
		const { payDialog, stripeModal } = this.state;


		if (prevProps.pathname !== pathname) {
// 			console.log('|:|:|:|:|:|:|:|:|:|:|:|', getRouteParams(pathname));
		}

		if (deeplink !== prevProps.deeplink && deeplink && deeplink.uploadID !== 0) {
			this.onAddUploadView(deeplink.uploadID);
		}

		if (profile) {
			if (!prevProps.profile) {
				this.props.fetchUserHistory({ profile });

// 				if (!team) {
// 					this.props.fetchUserHistory({ profile });
// 				}

				if (deeplink && deeplink.uploadID !== 0) {
					this.onAddUploadView(deeplink.uploadID);
				}

				if (this.state.ranking !== 0) {
					this.setState({ rating : 0 });
				}

				if (team && team.members.findIndex((member)=> (member.userID === profile.id)) === -1) {
					this.onToggleModal(Modals.REGISTER, false);
					this.onToggleModal(Modals.LOGIN, false);
					this.setState({ teamDialog : true });
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
			if ((!payDialog && !stripeModal) && (!profile.paid && artboards.length > freeAccount.upload_views) && ((isHomePage(false) && prevProps.deeplink.uploadID !== deeplink.uploadID) || (isInspectorPage() && prevProps.uploadID !== deeplink.uploadID))) {
// 			if ((!payDialog && !stripeModal) && (!profile.paid && artboards.length > 3) && ((isInspectorPage() && prevProps.uploadID !== deeplink.uploadID))) {
				this.setState({ payDialog : true });
			}

			if (payDialog && profile.paid) {
				this.setState({ payDialog : false });
			}
		}

		if (team && !prevProps.team) {
			if (!profile) {
				this.onToggleModal(Modals.REGISTER, true);

			} else {
				if (team.members.findIndex((member)=> (member.userID === profile.id)) === -1) {
					this.onToggleModal(Modals.REGISTER, false);
					this.onToggleModal(Modals.LOGIN, false);
					this.setState({ teamDialog : true });
				}
			}
		}
	}

	componentWillUnmount() {
		console.log('App.componentWillUnmount()');

		if (this.authInterval) {
			clearInterval(this.authInterval);
		}

		if (this.githubWindow) {
			this.githubWindow.close();
		}

		this.authInterval = null;
		this.githubWindow = null;


		window.onpopstate = null;
		window.removeEventListener('resize', this.handleResize);
	}


	handleAdBanner = (url)=> {
// 		console.log('App.handleAdBanner()', url);

		trackEvent('ad-banner', 'click');
		window.open(url);
	};

	handleArtboardClicked = (artboard)=> {
		console.log('App.handleArtboardClicked()', artboard);

		const { uploadID, pageID } = artboard;
		const artboardID = artboard.id;

		this.handlePage(buildInspectorPath({
				id    : uploadID,
				title : artboard.title
			}, URIs.firstComponent()
		));

		Browsers.scrollOrigin(wrapper.current);
		this.props.updateDeeplink({ uploadID, pageID, artboardID });

// 		const { profile, team } = this.props;
// 		if (profile && team && team.members.findIndex((member)=> (member.userID === profile.id)) > -1) {
// 			const { uploadID, pageID } = artboard;
// 			const artboardID = artboard.id;
//
// 			this.handlePage(buildInspectorPath({
// 					id    : uploadID,
// 					title : artboard.title
// 				}, URIs.firstComponent()
// 			));
//
// 			Browsers.scrollOrigin(wrapper.current);
// 			this.props.updateDeeplink({ uploadID, pageID, artboardID });
//
// 		} else {
// 			if (!profile) {
// 				this.onToggleModal(Modals.REGISTER, true);
//
// 			} else {
// 				this.onToggleModal(Modals.REGISTER, false);
// 				this.onToggleModal(Modals.LOGIN, false);
// 				this.setState({ teamDialog : true });
// 			}
// 		}
	};

	handleGithubAuth = ()=> {
		console.log('App.handleGithubAuth()');

		const code = DateTimes.epoch(true);
		axios.post(API_ENDPT_URL, qs.stringify({ code,
			action : 'GITHUB_AUTH'
		})).then((response) => {
			console.log('GITHUB_AUTH', response.data);
			const authID = response.data.auth_id << 0;
			this.setState({ authID }, ()=> {
				if (!this.githubWindow || this.githubWindow.closed || this.githubWindow.closed === undefined) {
					clearInterval(this.authInterval);
					this.authInterval = null;
					this.githubWindow = null;
				}

				const size = {
					width  : Math.min(460, window.screen.width - 20),
					height : Math.min(820, window.screen.height - 25)
				};

				this.githubWindow = window.open(GITHUB_APP_AUTH.replace('__{EPOCH}__', code), '', `titlebar=no, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${size.width}, height=${size.height}, top=${((((window.screen.height) - size.height) * 0.5) << 0)}, left=${((((window.screen.width) - size.width) * 0.5) << 0)}`);
				this.authInterval = setInterval(()=> {
					this.onAuthInterval();
				}, 1000);
			});
		}).catch((error)=> {
		});
	};

	handleGitHubAuthSynced = (profile, register=true)=> {
		console.log('App.handleGitHubAuthSynced()', profile, register);

		this.props.updateUserProfile(profile, false);
		this.props.updateUserProfile(profile);

		const { team } = this.props;
		if (team && team.members.findIndex((member)=> (member.userID === profile.id)) === -1) {
			this.setState({ teamDialog : true });

		} else {
// 			if (profile.integrations.length === 0) {
// 				trackEvent('user', 'sign-up');
// 				setTimeout(()=> {
// 					this.onToggleModal(Modals.INTEGRATIONS, true);
// 				}, 750);
//
// 			} else {
// 			}
		}
	};

	handleIntegrationsSubmitted = (profile)=> {
		console.log('App.handleIntegrationsSubmitted()', profile);

		this.onToggleModal(Modals.INTEGRATIONS, false);
		this.props.updateUserProfile(profile, false);
		this.props.updateUserProfile(profile);
		if (isProfilePage()) {
			this.handlePopup({
				type    : POPUP_TYPE_OK,
				content : 'Profile updated.',
				delay   : 333
			});

		} else {
			this.onToggleModal(Modals.CONFIG_UPLOAD, true);
		}
	};

	handleLoggedIn = (profile)=> {
		console.log('App.handleLoggedIn()', profile);
		this.props.updateUserProfile(profile, false);
		this.props.updateUserProfile(profile);
		this.props.fetchUserHistory({profile});

		const { team } = this.props;
		if (team && team.members.findIndex((member)=> (member.userID === profile.id)) === -1) {
			this.setState({ teamDialog : true });

		} else {
// 			if (profile.sources.length === 0 || profile.integrations.length === 0) {
// 				trackEvent('user', 'sign-up');
// 				setTimeout(()=> {
// 					this.onToggleModal(Modals.INTEGRATIONS, true);
// 				}, 1250);
//
// 			} else {
// 			}
		}
	};

	handleLogout = ()=> {
		cookie.save('user_id', '0', { path : '/' });
		trackEvent('user', 'sign-out');

		this.props.updateUserProfile(null);
		this.props.purgeHomeArtboards();
		this.handlePage('');
	};

	handlePage = (url, clearDeeplink=true)=> {
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
			this.props.history.push(`/`);

		} else {
			trackPageview(`/${url}`);
			this.props.history.push(`/${url}`);
		}

		if (clearDeeplink) {
			this.props.updateDeeplink(null);
		}
	};

	handlePaidAlert = ()=> {
// 		console.log('App.handlePaidAlert()');

		this.onToggleModal(Modals.STRIPE, true);
	};

	handlePopup = (payload)=> {
// 		console.log('App.handlePopup()', payload);
		this.setState({ popup : payload });
	};

	handleProcessing = (processing)=> {
		console.log('App.handleProcessing()', processing);
		this.setState({ processing });
	};

	handlePurchaseSubmitted = (purchase)=> {
// 		console.log('App.handlePurchaseSubmitted()', purchase);

		this.onToggleModal(Modals.STRIPE, false);
		this.props.fetchUserProfile();
	};

	handleRegistered = (profile, github=false)=> {
		console.log('App.handleRegistered()', profile, github);
		this.props.updateUserProfile(profile, false);
		this.props.updateUserProfile(profile);

		if (this.props.team) {
			this.setState({ teamDialog : true });

		} else {
// 			if (profile.integrations.length === 0) {
// 				setTimeout(()=> {
// 					this.onToggleModal(Modals.INTEGRATIONS, true);
// 				}, 1250);
// 			} else {
// 			}
		}
	};

	handleResize = (event)=> {
// 		console.log('App.handleResize()', event);

		this.setState({ contentSize : {
			width  : wrapper.current.innerWidth,
			height : wrapper.current.innerHeight
		} });
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

	handleTeamDialogComplete = (ok)=> {
		console.log('App.handleTeamDialogComplete()', ok);

		const { profile, team } = this.props;
		this.setState({ teamDialog : false }, ()=> {
			if (ok) {
				axios.post(API_ENDPT_URL, qs.stringify({
					action  : 'JOIN_TEAM',
					team_id : team.id,
					user_id : profile.id,
					type    : 'member'
				})).then((response)=> {
					console.log('JOIN_TEAM', response.data);
					this.props.fetchTeamLookup();
				}).catch((error)=> {
				});

				if (profile.sources.length === 0 || profile.integrations.length === 0) {
					setTimeout(()=> {
						this.onToggleModal(Modals.INTEGRATIONS, true);
					}, 750);

				} else {
				}

			} else {
				this.handlePage('');
			}
		});
	};

	onAddUploadView = (uploadID)=> {
		console.log('App.onAddUploadView()', uploadID);

		axios.post(API_ENDPT_URL, qs.stringify({
			action    : 'ADD_VIEW',
			upload_id : uploadID
		})).then((response)=> {
			console.log('ADD_VIEW', response.data);

			const { profile } = this.props;
			if (profile) {
				axios.post(API_ENDPT_URL, qs.stringify({
					action    : 'ADD_HISTORY',
					upload_id : uploadID,
					user_id   : profile.id
				})).then((response)=> {
					console.log('ADD_HISTORY', response.data);
					this.props.fetchUserHistory({profile});

				}).catch((error)=> {
				});
			}
		}).catch((error)=> {
		});
	};

	onAuthInterval = ()=> {
// 		console.log('App.onAuthInterval()');

		if (!this.githubWindow || this.githubWindow.closed || this.githubWindow.closed === undefined) {

			if (this.authInterval) {
				clearInterval(this.authInterval);
			}
			if (this.githubWindow) {
				this.githubWindow.close();
			}

			this.authInterval = null;
			this.githubWindow = null;

		} else {
			const { authID } = this.state;
			axios.post(API_ENDPT_URL, qs.stringify({
				action  : 'GITHUB_AUTH_CHECK',
				auth_id : authID
			})).then((response) => {
				console.log('GITHUB_AUTH_CHECK', response.data);
				const { user } = response.data;
				if (user) {
					trackEvent('github', 'success');
					clearInterval(this.authInterval);
					this.authInterval = null;
					this.githubWindow.close();
					this.githubWindow = null;
					this.handleGitHubAuthSynced(user);
				}
			}).catch((error)=> {
			});
		}
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

	onToggleModal = (url, show)=> {
		console.log('App.onToggleModal()', url, show);

		if (show) {
			this.setState({
				configUploadModal : false,
				githubModal       : false,
				integrationsModal : false,
				loginModal        : (this.state.loginModal && url === Modals.GITHUB_CONNECT),
				registerModal     : (this.state.registerModal && url === Modals.GITHUB_CONNECT),
				stripeModal       : false
			});

			if (url === Modals.CONFIG_UPLOAD) {
				this.setState({ configUploadModal : true });

			} else if (url === Modals.GITHUB_CONNECT) {
				this.handleGithubAuth();

			} else if (url === Modals.INTEGRATIONS) {
				this.setState({ integrationsModal : true });

			} else if (url === Modals.LOGIN) {
				this.setState({ loginModal : true });

			} else if (url === Modals.REGISTER) {
				this.setState({ registerModal : true });

			} else if (url === Modals.STRIPE) {
				this.setState({
					payDialog   : false,
					stripeModal : true
				});
			}

		} else {
			if (url === Modals.CONFIG_UPLOAD) {
				this.setState({ configUploadModal : false });

			} else if (url === Modals.GITHUB_CONNECT) {
				this.setState({ githubModal : false });

			} else if (url === Modals.INTEGRATIONS) {
				this.setState({ integrationsModal : false });

			} else if (url === Modals.LOGIN) {
				this.setState({ loginModal : false });

			} else if (url === Modals.REGISTER) {
				this.setState({ registerModal : false });

			} else if (url === Modals.STRIPE) {
				if (isInspectorPage()) {
					this.handlePage('');

					setTimeout(()=> {
						this.setState({
							payDialog   : false,
							stripeModal : false
						});
					}, 1250);

				} else {
					this.setState({
						payDialog   : false,
						stripeModal : false
					});
				}
			}
		}
	};


	render() {
//   	console.log('App.render()', this.props, this.state);

		const { profile, team } = this.props;
		const { pathname } = this.props.location;
  	const { allowMobile, processing, popup } = this.state;
  	const { integrationsModal, loginModal, registerModal, configUploadModal, stripeModal, payDialog, teamDialog } = this.state;
//   	const processing = true;

  	return ((!Browsers.isMobile.ANY() || !allowMobile)
		  ? (<div className="desktop-site-wrapper">
			    <TopNav
				    mobileLayout={false}
				    pathname={pathname}
				    onModal={(url)=> this.onToggleModal(url, true)}
				    onPage={this.handlePage}
				    onLogout={this.handleLogout}
				    onScore={this.handleScore}
			    />

			    <div className="content-wrapper" ref={wrapper}>
				    <Switch>
					    <Route exact path="/invite-team"><Redirect to="/" /></Route>
					    <Route exact path="/"><Redirect to="/specs" /></Route>
					    {(!isUserLoggedIn()) && (<Route exact path="/profile"><Redirect to="/" /></Route>)}
					    <Route exact path="/logout" render={()=> (profile) ? this.handleLogout() : null} />

					    <Route exact path="/:section(specs|styles|parts|edit)" render={()=> <HomePage onArtboardClicked={this.handleArtboardClicked} onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/signup" render={()=> <SignupPage onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/new"><Redirect to="/new/specs" /></Route>
					    <Route exact path="/new/:type(specs|styles|parts|edit)" render={(props)=> <UploadPage { ...props } onProcessing={this.handleProcessing} onRegistered={this.handleRegistered} onScrollOrigin={this.handleScrollOrigin} onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route exact path="/:section(specs|styles|parts|`edit)/:uploadID/:titleSlug" render={(props)=> <InspectorPage { ...props } processing={processing} onProcessing={this.handleProcessing} onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route path="/profile/:username?" render={(props)=> <ProfilePage { ...props } onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/integrations" render={()=> <IntegrationsPage onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    <Route exact path="/team/:teamID?" render={()=> <TeamPage onPage={this.handlePage} onPopup={this.handlePopup} />} />
					    {/*<Route exact path="/rate-this" render={()=> <RateThisPage score={rating} onPage={this.handlePage} />} />*/}
					    <Route path="/recover/:userID?" render={(props)=> <RecoverPage { ...props } onLogout={this.handleLogout} onPage={this.handlePage} onPopup={this.handlePopup} />} />

					    <Route exact path="/privacy" render={()=> <PrivacyPage />} />
					    <Route exact path="/terms" render={()=> <TermsPage />} />
					    {/*<Route exact path="/invite-team" render={()=> <InviteTeamPage uploadID={uploadID} onPage={this.handlePage} onPopup={this.handlePopup} />} />*/}

					    {/*<Route render={()=> <Status404Page onPage={this.handlePage} />} />*/}
					    <Route><Status404Page onPage={this.handlePage} /></Route>
					    {/*<Route><Redirect to="/" /></Route>*/}
				    </Switch>

				    {(!isInspectorPage()) && (<BottomNav
					    mobileLayout={false}
					    onLogout={()=> this.handleLogout()}
					    onModal={(url)=> this.onToggleModal(url, true)}
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
								  onComplete={()=> this.onToggleModal(Modals.CONFIG_UPLOAD, false)}
								  onSubmitted={()=> this.onToggleModal(Modals.CONFIG_UPLOAD, false)}
							  />)}

							  {(loginModal) && (<LoginModal
								  inviteID={null}
								  outro={(profile !== null)}
								  onModal={(url)=> this.onToggleModal(url, true)}
								  onPage={this.handlePage}
								  onPopup={this.handlePopup}
								  onComplete={()=> this.onToggleModal(Modals.LOGIN, false)}
								  onLoggedIn={this.handleLoggedIn}
							  />)}

							  {(registerModal) && (<RegisterModal
								  inviteID={null}
								  outro={(profile !== null)}
								  onModal={(url)=> this.onToggleModal(url, true)}
								  onPage={this.handlePage}
								  onPopup={this.handlePopup}
								  onComplete={()=> this.onToggleModal(Modals.REGISTER, false)}
								  onRegistered={this.handleRegistered}
							  />)}

							  {(integrationsModal) && (<IntegrationsModal
								  profile={profile}
								  onPopup={this.handlePopup}
								  onComplete={()=> this.onToggleModal(Modals.INTEGRATIONS, false)}
								  onSubmitted={this.handleIntegrationsSubmitted}
							  />)}

							  {(payDialog) && (<AlertDialog
								  title="Limited Account"
								  message={`You must upgrade to an unlimited account to view more than ${freeAccount.upload_views} ${Strings.pluralize('project', freeAccount.upload_views)}.`}
								  onComplete={this.handlePaidAlert}
							  />)}

							  {(teamDialog) && (<ConfirmDialog
								  title="Confirm Team Membership"
								  message={`Are you sure you want to join the "${team.title}" team?`}
								  onComplete={this.handleTeamDialogComplete}
							  />)}

							  {(stripeModal) && (<StripeModal
								  profile={profile}
								  onPage={this.handlePage}
								  onPopup={this.handlePopup}
								  onSubmitted={this.handlePurchaseSubmitted}
								  onComplete={()=> this.onToggleModal(Modals.STRIPE, false)}
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
					    onModal={(url)=> this.onToggleModal(url, true)}
					    onPage={this.handlePage}
				    />
			    </div>
		    </div>)
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
