
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import qs from 'qs';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { Column } from 'simple-flexbox';

import BottomNav from '../sections/BottomNav';
import AlertDialog from '../overlays/AlertDialog';
import BaseOverlay from '../overlays/BaseOverlay';
import LoginModal from '../overlays/LoginModal';
// import PopupNotification, { POPUP_TYPE_OK } from '../overlays/PopupNotification';
import PopupNotification from '../overlays/PopupNotification';
import RegisterModal from '../overlays/RegisterModal';
import StripeModal from '../overlays/StripeModal';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import PrivacyPage from '../pages/PrivacyPage';
import AccountPage from '../pages/AccountPage';
import Status404Page from '../pages/Status404Page';
import TermsPage from '../pages/TermsPage';

import {
	API_ENDPT_URL,
	GITHUB_APP_AUTH,
	Modals }
from '../../consts/uris';
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
// 	getRouteParams,
	idsFromPath,
	isInspectorPage,
	isUserLoggedIn
} from '../../utils/funcs';
import { DateTimes, Strings, URIs } from '../../utils/lang';
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
			scrolling     : false,
			contentSize   : {
				width  : 0,
				height : 0
			},
			rating        : 0,
			popup         : null,
			loginModal    : false,
			registerModal : false,
			githubModal   : false,
			payDialog     : false,
			stripeModal   : false,
			authID        : 0
		};

		this.githubWindow = null;
		this.authInterval = null;

		initTracker(cookie.load('user_id'));
	}

	componentDidMount() {
		console.log('App.componentDidMount()', this.props, this.state);

		trackEvent('site', 'load');
		trackPageview();

// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (Strings.randHex())), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (new Array(20)).fill(null).map((i)=> (parseInt(Maths.randomHex(), 16))), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');
// 		console.log('\n//=-=//-=-//=-=//-=-//=-=//-=-//=-=//', (URIs.queryString()), '//=-=//-=-//=-=//-=-//=-=//-=-//=-=//\n');


		window.addEventListener('resize', this.handleResize);
// 		window.addEventListener('scroll', this.handleScroll);
		window.onpopstate = (event)=> {
			console.log('-/\\/\\/\\/\\/\\/\\-', 'window.onpopstate()', '-/\\/\\/\\/\\/\\/\\-', event);

			this.props.updateDeeplink(idsFromPath());
// 			this.handlePage('<<');
// 			this.handlePage(event.target.location.pathname, false);
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('App.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		const { pathname } = this.props.location;

		if (prevProps.pathname !== pathname) {
// 			console.log('|:|:|:|:|:|:|:|:|:|:|:|', getRouteParams(pathname));
		}

		if (profile) {
			if (!prevProps.profile) {
				this.props.fetchUserHistory({ profile });

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
	};

	handleLoggedIn = (profile)=> {
		console.log('App.handleLoggedIn()', profile);
		this.props.updateUserProfile(profile, false);
		this.props.updateUserProfile(profile);
		this.props.fetchUserHistory({profile});
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

		if (URIs.firstComponent() !== URIs.firstComponent(url)) {
			window.scrollTo(0, 0);
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

	handlePurchaseSubmitted = (purchase)=> {
// 		console.log('App.handlePurchaseSubmitted()', purchase);

		this.onToggleModal(Modals.STRIPE, false);
		this.props.fetchUserProfile();
	};

	handleRegistered = (profile, github=false)=> {
		console.log('App.handleRegistered()', profile, github);
		this.props.updateUserProfile(profile, false);
		this.props.updateUserProfile(profile);
	};

	handleResize = (event)=> {
// 		console.log('App.handleResize()', event);

		this.setState({ contentSize : {
			width  : wrapper.current.innerWidth,
			height : wrapper.current.innerHeight
		} });
	};

	handleScroll = (event)=> {
		console.log('App.handleScroll()', event);
		this.setState({ scrolling : true }, ()=> {
			setTimeout(()=> {
				this.setState({ scrolling : false });
			}, 1000);
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

	onToggleModal = (url, show)=> {
		console.log('App.onToggleModal()', url, show);

		if (show) {
			this.setState({
				githubModal   : false,
				loginModal    : (this.state.loginModal && url === Modals.GITHUB_CONNECT),
				registerModal : (this.state.registerModal && url === Modals.GITHUB_CONNECT),
				stripeModal   : false
			});

			if (url === Modals.GITHUB_CONNECT) {
				this.handleGithubAuth();

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
			if (url === Modals.GITHUB_CONNECT) {
				this.setState({ githubModal : false });

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

		const { profile } = this.props;
  	const { scrolling, popup } = this.state;
  	const { loginModal, registerModal, stripeModal, payDialog } = this.state;

  	return (<div className="site-wrapper"><Column horizontal="center">
	    <div className="content-wrapper" ref={wrapper}>
		    <Switch>
			    {(!isUserLoggedIn()) && (<Route exact path="/profile"><Redirect to="/" /></Route>)}
			    <Route exact path="/logout" render={()=> (profile) ? this.handleLogout() : null} />

			    <Route exact path="/" render={()=> <HomePage onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} onRegistered={this.handleRegistered} />} />
			    <Route exact path="/free-trial" render={()=> <HomePage scrolling={scrolling} onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} onRegistered={this.handleRegistered} />} />
			    <Route path="/profile/:username?" render={(props)=> <ProfilePage { ...props } onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />
			    <Route path="/:section(confirm|recover)/:userID" render={(props)=> <AccountPage { ...props } onLogout={this.handleLogout} onPage={this.handlePage} onPopup={this.handlePopup} />} />
			    <Route exact path="/privacy" render={()=> <PrivacyPage />} />
			    <Route exact path="/terms" render={()=> <TermsPage />} />

			    <Route><Status404Page onPage={this.handlePage} /></Route>
		    </Switch>

		    <BottomNav
			    mobileLayout={false}
			    onLogout={()=> this.handleLogout()}
			    onModal={(url)=> this.onToggleModal(url, true)}
			    onPage={this.handlePage}
		    />
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

					  {(payDialog) && (<AlertDialog
						  title="Limited Account"
						  message={`You must upgrade to an unlimited account to view more than ${freeAccount.upload_views} ${Strings.pluralize('project', freeAccount.upload_views)}.`}
						  onComplete={this.handlePaidAlert}
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
	  </Column></div>);
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
