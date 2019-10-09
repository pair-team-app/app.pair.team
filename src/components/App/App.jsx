
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import { DateTimes } from 'lang-js-utils';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

// import AlertDialog from '../overlays/AlertDialog';
import LoginModal from '../overlays/LoginModal';
import PopupNotification from '../overlays/PopupNotification';
import RegisterModal from '../overlays/RegisterModal';
import StripeModal from '../overlays/StripeModal';
import TopNav from '../sections/TopNav';
import BottomNav from '../sections/BottomNav';
import HomePage from '../pages/HomePage';
import FeaturesPage from '../pages/FeaturesPage';
import PricingPage from '../pages/PricingPage';
import PrivacyPage from '../pages/PrivacyPage';
import Status404Page from '../pages/Status404Page';
import TermsPage from '../pages/TermsPage';

import {
	API_ENDPT_URL,
	GITHUB_APP_AUTH,
	GITHUB_CHANGELOG,
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
// 	getRouteParams,
	idsFromPath
} from '../../utils/funcs';
import { initTracker, trackEvent, trackPageview } from '../../utils/tracking';


const wrapper = React.createRef();


class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			authID      : 0,
			darkTheme   : false,
			contentSize : {
				width  : 0,
				height : 0
			},
			popup       : null,
			modals      : {
				login    : false,
				register : false,
				github   : false,
				stripe   : false,
			}
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
		window.addEventListener('scroll', this.handleScroll);
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


	handleChangelog = ()=> {
		console.log('App.handleChangelog()');
		window.open(GITHUB_CHANGELOG);
	};

	handleGithubAuth = ()=> {
		console.log('App.handleGithubAuth()');

		const code = DateTimes.epoch(true);
		axios.post(API_ENDPT_URL, {
			action  : 'GITHUB_AUTH',
			payload : { code }
		}).then((response) => {
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

		axios.post(API_ENDPT_URL, {
			action  : 'REGISTER',
			payload : {
				username : profile.email,
				email    : profile.email,
				type     : 'wait_list'
			}
		}).then((response) => {
			console.log('REGISTER', response.data);

		}).catch((error)=> {
		});

// 		this.handlePage(Pages.THANK_YOU);
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
		url = ((!url) ? '' : url).replace(/^\/(.*)$/, '$1');

// 		if (URIs.firstComponent() !== URIs.firstComponent(url)) {
// 			window.scrollTo(0, 0);
// 		}

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
// 		console.log('App.handleScroll()', event);
// 		this.setState({ scrolling : true }, ()=> {
// 			setTimeout(()=> {
// 				this.setState({ scrolling : false });
// 			}, 1000);
// 		});
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

			axios.post(API_ENDPT_URL, {
				action  : 'GITHUB_AUTH_CHECK',
				payload : { authID }
			}).then((response) => {
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
		const { modals } = this.state;

		if (show) {
			this.setState({ modals : { ...modals,
				github   : false,
				login    : (url === Modals.LOGIN),
				register : (url === Modals.REGISTER),
				stripe   : (url === Modals.STRIPE) }
			});

		} else {
			this.setState({ modals : { ...modals,
				github   : (url === Modals.GITHUB_CONNECT) ? false : modals.github,
				login    : (url === Modals.LOGIN) ? false : modals.login,
				register : (url === Modals.REGISTER) ? false : modals.register,
				stripe   : (url === Modals.STRIPE) ? false : modals.stripe }
			});
		}
	};

	handleToggleTheme = (event)=> {
		console.log('App.handleToggleTheme()', event);
		this.setState({ darkTheme : !this.state.darkTheme });
	};


	render() {
//   	console.log('App.render()', this.props, this.state);

		const { profile } = this.props;
  	const { darkTheme, popup, modals } = this.state;

  	return (<div className={`site-wrapper${(darkTheme) ? ' site-wrapper-dark' : ''}`}>
		  <TopNav darkTheme={darkTheme} onToggleTheme={this.handleToggleTheme} onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} />
	    <div className="content-wrapper" ref={wrapper}>
		    <Switch>
			    <Route exact path="/" render={()=> <HomePage onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} onRegistered={this.handleRegistered} />} />
			    <Route exact path="/features" render={()=> <FeaturesPage onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />
			    <Route exact path="/pricing" render={()=> <PricingPage onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} onPopup={this.handlePopup} />} />
			    <Route exact path="/:page(legal|privacy)" render={()=> <PrivacyPage />} />
			    <Route exact path="/terms" render={()=> <TermsPage />} />

			    <Route path="*"><Status404Page onPage={this.handlePage} /></Route>
		    </Switch>
	    </div>
		  <BottomNav onModal={(url)=> this.onToggleModal(url, true)} onPage={this.handlePage} />

		  <div className="modal-wrapper">
			  {(popup) && (<PopupNotification payload={popup} onComplete={()=> this.setState({ popup : null })}>
				  {popup.content}
			  </PopupNotification>)}

			  {(modals.login) && (<LoginModal
				  inviteID={null}
				  outro={(profile !== null)}
				  onModal={(url)=> this.onToggleModal(url, true)}
				  onPage={this.handlePage}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.LOGIN, false)}
				  onLoggedIn={this.handleLoggedIn}
			  />)}

			  {(modals.register) && (<RegisterModal
				  inviteID={null}
				  outro={(profile !== null)}
				  onModal={(url)=> this.onToggleModal(url, true)}
				  onPage={this.handlePage}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.REGISTER, false)}
				  onRegistered={this.handleRegistered}
			  />)}

			  {/*{(payDialog) && (<AlertDialog*/}
				  {/*title="Limited Account"*/}
				  {/*message="You must upgrade to an unlimited account to view more"*/}
				  {/*onComplete={this.handlePaidAlert}*/}
			  {/*/>)}*/}

			  {(modals.stripe) && (<StripeModal
				  profile={profile}
				  onPage={this.handlePage}
				  onPopup={this.handlePopup}
				  onSubmitted={this.handlePurchaseSubmitted}
				  onComplete={()=> this.onToggleModal(Modals.STRIPE, false)}
			  />)}
		  </div>
	  </div>);
  }
}


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


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
