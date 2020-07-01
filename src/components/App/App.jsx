
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import { Browsers, DateTimes } from 'lang-js-utils';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { generatePath, matchPath, withRouter } from 'react-router-dom';

import Routes, { RoutePaths } from '../helpers/Routes';
import ConfirmDialog from '../overlays/ConfirmDialog';
import CookiesOverlay from '../overlays/CookiesOverlay';
import InviteModal from '../overlays/InviteModal';
import LoginModal from '../overlays/LoginModal';
import PopupNotification, { POPUP_TYPE_OK } from '../overlays/PopupNotification';
import ProfileModal from '../overlays/ProfileModal';
import RegisterModal from '../overlays/RegisterModal';
import StripeModal from '../overlays/StripeModal';
import BottomNav from '../sections/BottomNav';
import LeftNav from '../sections/LeftNav';
import TopNav from '../sections/TopNav';

import { API_ENDPT_URL, Modals, Pages } from '../../consts/uris';
import { fetchTeamLookup, fetchUserProfile, setPlayground, updateMatchPath, updateUserProfile } from '../../redux/actions';
import { initTracker, trackEvent, trackPageview } from '../../utils/tracking';

const MATTY_DEVIN_THEME = false;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      darkTheme : false,
      popup     : null,
      inviteID  : null,
      modals    : {
        cookies  : cookie.load('cookies') << 0 === 0,
        disable  : false,
        invite   : false,
        login    : false,
        network  : !Browsers.isOnline(),
        noAccess : false,
        profile  : false,
        register : false,
        stripe   : false,
        payload  : null
      }
    };

    initTracker(cookie.load('user_id'), window.location.hostname);
  }

  componentDidMount() {
    		console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    trackEvent('site', 'load');
    trackPageview();
    //
    // console.log('[:][:][:][:][:][:][:][:][:][:]', makeAvatar('M'));

    const { profile, location } = this.props;
    // if (!profile && location.pathname.startsWith(Pages.PROJECT)) {
    if (!profile && (location.pathname.startsWith(Pages.PROJECT) || location.pathname.startsWith(Pages.TEAM)) && cookie.load('user_id') === '0') {
      this.onToggleModal(Modals.LOGIN);
    }

    if (!profile && cookie.load('user_id') === '0') {
      if (location.pathname.startsWith(Pages.PROJECT) || location.pathname.startsWith(Pages.TEAM)) {
        this.onToggleModal(Modals.LOGIN);

      } else if (location.pathname.startsWith(Pages.INVITE)) {
        this.setState({ inviteID : location.pathname.split('/')[3] << 0 }, ()=> {
          this.onToggleModal(Modals.REGISTER);
        });
      }
    }

    if (!Browsers.isOnline()) {
      this.handlePopup({
        type     : POPUP_TYPE_OK,
        content  : 'Check your network connection to continue.',
        delay    : 125,
        duration : 2350
      });
    }

    window.onpopstate = (event)=> {
      event.preventDefault();
      // console.log('%s.onpopstate()', this.constructor.name, '-/\\/\\/\\/\\/\\/\\-', this.props.location.pathname, event);
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state, snapshot });
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state.modals);


    // check for playground url
    const matchPlaygrounds = matchPath(this.props.location.pathname, {
      path : RoutePaths.PROJECT,
      exact : false,
      strict: false
    }) || {};

    const historyMatch = matchPath(this.props.location.pathname, {
      path : RoutePaths.PROJECT,
      exact : false,
      strict: false
    });

    if (prevProps.matchPath && this.props.matchPath) {
      // console.log('??+=+=+=+=+=+=+=+', { matchPlaygrounds, historyMatch, prevMatchPath : prevProps.matchPath, currMatchPath : this.props.matchPath });
      // console.log(`~≈["${this.props.history.action}" HISTORY(${prevProps.history.action})]≈~`);

      if (this.props.history.action === 'POP') {
        // this.props.history.goBack();
      }

      //x if (this.props.matchPath.params && historyMatch.params === matchPlaygrounds.params && this.props.matchPath.params.buildID > 0) {
      // if (this.props.matchPath.params && matchPlaygrounds.url !== historyMatch.url) {
      if (this.props.matchPath.params && ((this.props.matchPath.params !== prevProps.matchPath.params) || (this.props.matchPath.location.pathname !== prevProps.matchPath.location.pathname))) {
        // const path = generatePath(RoutePaths.PROJECT, { ...this.props.matchPath.params,
        const path = generatePath(RoutePaths.PROJECT, { ...this.props.matchPath.params,
          ax       : undefined,
          comments : (this.props.matchPath.params.comments) ? 'comments' : undefined
        });
        console.log('??*=*=*=*=*=*=*=*]] PUSH HISTORY -->>', { path, prevAction : prevProps.history.action, currAction : this.props.history.action });

        this.props.history.push(path);
      }
    }

    // console.log('!!!!!!!!!!!', { online : Browsers.isOnline() });
    // console.log('+=+=+=+=+=+=+=+', { matchPlaygrounds });

    // extract url props
    const { location, profile, team, playgrounds, playground } = this.props;
    // const { pathname } = (matchPlaygrounds && Object.keys(matchPlaygrounds).length > 0) ? this.props.location : '';
    const { pathname } = location;
    const { modals } = this.state;

    // url changed
    if (prevProps.location.pathname !== pathname) {
      trackPageview();
    }

    // no internet
    // if (!modals.network && !Browsers.isOnline()) {
    if (!Browsers.isOnline()) {
      // this.onToggleModal(Modals.NETWORK);
      // this.handlePopup({
      //   type     : POPUP_TYPE_OK,
      //   content  : 'Project URL has been copied to your clipboard',
      //   delay    : 125,
      //   duration : 3333
      // });

    } else {

      if (profile && team && team.type == 'free' && !modals.stripe) {
        if (team.members.length >= 2) {
          this.onToggleModal(Modals.STRIPE);
        }
      }


      // const pass = (prevProps.matchPath && this.props.matchPath) ? (Object.keys(this.props.matchPath.params).map((key)=> ((this.props.matchPath.params[key] === prevProps.matchPath.params[key]))).reduce((acc, val)=> (acc * val), 1) === 0) : false;

      // console.log('+=+=+=+=+=+=+=+', { matchPlaygrounds, props : this.props.matchPath, prev : prevProps.matchPath, historyMatch });
      // console.log('+=+=+=+=+=+=+=+', { props : (this.props.matchPath) ? { ...this.props.matchPath.params } : null, prev : (prevProps.matchPath) ? { ...prevProps.matchPath.params } : null, pass });
      // console.log('+=+=+=+=+=+=+=+', { props : (this.props.matchPath) ? { ...this.props.matchPath.params } : null, prev : (prevProps.matchPath) ? { ...prevProps.matchPath.params } : null });
      if (matchPlaygrounds !== null && (this.props.matchPath === null || (this.props.matchPath && matchPlaygrounds.url !== this.props.matchPath.url))) {
      // if (this.props.matchPath === null && matchPlaygrounds !== null && matchPlaygrounds.url !== historyMatch.url) {
      // if ((this.props.matchPath === null && matchPlaygrounds !== null) || (matchPlaygrounds.url !== this.props.matchPath.url)) {
      // if ((this.props.matchPath === null && matchPlaygrounds !== null) || (this.props.matchPath && prevProps.matchPath && prevProps.matchPath.params !== this.props.matchPath.params)) {
      //x if ((this.props.matchPath === null) || (this.props.matchPath && prevProps.matchPath && pass)) {
        console.log('+=+=+=+=+=+=+=+]] UPDATE PATH PARAMS -->', { matchPlaygrounds, props : this.props.matchPath });
        this.props.updateMatchPath({
          matchPath : { ...matchPlaygrounds,
            location : { ...this.props.location,
              state : { referer : 'APP' }
            }
          }
        });
      }


      // dismiss login modal after profile
      if (profile !== null && modals.login) {
        this.onToggleModal(Modals.LOGIN, false);
      }


      // if (products && team !== null && prevProps.team === null) {
      //   const modal = (team.members.length > 10 && team.type === 'free') || (team.members.length > 50 && team.type !== 'enterprise');
      //   if (modal && !prevState.modals.stripe && !modals.stripe) {
      //     const product = products.find(({ threshold })=> team.members.length >= threshold);
      //     this.onToggleModal(Modals.STRIPE, true, { team, product });
      //   }
      // }

      // on a playground url
      if (matchPlaygrounds) {

        // not a team member, block access
        if (profile && team && playground && team.id !== playground.teamID && !prevState.modals.noAccess && !modals.noAccess) {
          this.onToggleModal(Modals.NO_ACCESS);
        }

        if (this.props.matchPath) {
          // const { teamSlug, projectSlug, buildID, deviceSlug, typeGroupSlug, componentID, comments, commentID } = this.props.matchPath.params || {};
          const { teamSlug, projectSlug, buildID, deviceSlug, typeGroupSlug } = this.props.matchPath.params || {};

          if (!prevProps.team && team) {
            if (teamSlug !== team.slug || !projectSlug) {
              this.props.history.push(`${Pages.TEAM}/${team.slug}-${team.id}`);
            }
          }

          if (!profile && !prevState.modals.login && !modals.login) {
            // this.onToggleModal(Modals.LOGIN);
          }

          /*
          if (!this.props.location.pathname.includes('/team') && playgrounds && (!buildID || !deviceSlug || !typeGroupSlug)) {
            const pg = [ ...playgrounds].shift();
            this.props.updateMatchPath({
              matchPath : { ...this.props.matchPath,
                params : { ...this.props.matchPath.params,
                  projectSlug   : (projectSlug !== pg.projectSlug) ? pg.projectSlug : projectSlug,
                  buildID       : (!buildID) ? pg.buildID : buildID,
                  deviceSlug    : (!deviceSlug) ? pg.device.slug : deviceSlug,
                  typeGroupSlug : (!typeGroupSlug) ? [ ...pg.typeGroups].pop().key : typeGroupSlug
                }
              }
            });
          }
          */
        }
      }
    }
  }

  componentWillUnmount() {
    // console.log('%s.componentWillUnmount()', this.constructor.name);

    window.onpopstate = null;
  }

  handleCookies = ()=> {
    // console.log('%s.handleCookies()', this.constructor.name);
    this.onToggleModal(Modals.COOKIES, false);
    cookie.save('cookies', '1', { path: '/', sameSite: false });
  };

  handleDisableAccount = ()=> {
	  // console.log('%s.handleDisableAccount()', this.constructor.name);

    const { profile } = this.props;

    axios
      .post(API_ENDPT_URL, {
        action: 'DISABLE_ACCOUNT',
        payload: { user_id: profile.id }
      })
      .then((response)=> {
        // console.log('DISABLE_ACCOUNT', response.data);

        trackEvent('user', 'delete-account');
        this.props.updateUserProfile(null);
        this.props.history.push(Pages.HOME);
      })
      .catch((error)=> {});
  };

  handleLogout = (page = null, modal = null)=> {
    // console.log('%s.handleLogout()', this.constructor.name, this.constructor.name, page, modal);
    trackEvent('user', 'sign-out');

    this.props.updateUserProfile(null);

    if (modal) {
      this.onToggleModal(modal);
    }

    if (page) {
      this.props.history.push(page);
    }
  };

  handlePopup = (payload)=> {
    // console.log('%s.handlePopup()', this.constructor.name, payload);
    this.setState({ popup : payload });
  };

  handlePurchaseSubmitted = (purchase)=> {
    // console.log('%s.handlePurchaseSubmitted()', this.constructor.name, purchase);

    this.onToggleModal(Modals.STRIPE, false);

    this.props.fetchUserProfile();
    // const { profile } = this.props;
    // this.props.fetchTeamLookup({ userID: profile.id });
  };

  handleThemeToggle = (event)=> {
    // console.log('%s.handleThemeToggle()', this.constructor.name, event);
    this.setState({ darkTheme : !this.state.darkTheme });
  };

  handleUpdateUser = (profile)=> {
    console.log('%s.handleUpdateUser()', this.constructor.name, profile);
    this.props.updateUserProfile(profile);
  };

  onToggleModal = (uri, show = true, payload = null)=> {
    console.log('%s.onToggleModal()', this.constructor.name, uri, show, payload, this.state.modals);
    const { modals } = this.state;

    if (show) {
      this.setState({
        modals : { ...modals, payload,
          disable  : uri === Modals.DISABLE,
          login    : uri === Modals.LOGIN,
          invite   : uri === Modals.INVITE,
          network  : uri === Modals.NETWORK,
          noAccess : uri === Modals.NO_ACCESS,
          profile  : uri === Modals.PROFILE,
          register : uri === Modals.REGISTER,
          stripe   : uri === Modals.STRIPE
        }
      });
    } else {
      this.setState({
        modals : { ...modals,
          cookies  : uri === Modals.COOKIES ? false : modals.cookies,
          disable  : uri === Modals.DISABLE ? false : modals.disable,
          invite   : uri === Modals.INVITE ? false : modals.invite,
          login    : uri === Modals.LOGIN ? false : modals.login,
          network  : uri === Modals.NETWORK ? false : modals.network,
          noAccess : uri === Modals.NO_ACCESS ? false : modals.noAccess,
          profile  : uri === Modals.PROFILE ? false : modals.profile,
          register : uri === Modals.REGISTER ? false : modals.register,
          stripe   : uri === Modals.STRIPE ? false : modals.stripe,
          payload  : null
        }
      });
    }
  };

  render() {
    const matchPlaygrounds = matchPath(this.props.location.pathname, {
      path : RoutePaths.PROJECT,
      exact : false,
      strict: false
    });



      	// console.log('%s.render()', this.constructor.name, { props : this.props, matchPlaygrounds });
      	console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
      	// console.log('%s.render()', this.constructor.name, this.state.modals);

    const { darkThemed, profile, location } = this.props;
    const { popup, inviteID, modals } = this.state;

    const { pathname } = location;

    return (<div className="site-wrapper" data-theme={(darkThemed) ? 'dark' : 'light'} data-devin-matty={MATTY_DEVIN_THEME}>
      {/* {(!matchPlaygrounds) && (<TopNav darkTheme={darkThemed} onToggleTheme={this.handleThemeToggle} onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} />)} */}
      <LeftNav />


	    {/* <div className={`page-wrapper${(location.pathname.startsWith(Pages.PROJECT) && !location.pathname.includes(Pages.TEAM)) ? ' playground-page-wrapper' : ''}`}> */}
	    {/* <div className="page-wrapper"> */}
	    <div className="page-wrapper">
        <TopNav darkTheme={darkThemed} onToggleTheme={this.handleThemeToggle} onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} />
		    <Routes onLogout={this.handleLogout} onModal={this.onToggleModal} onPopup={this.handlePopup} { ...this.props } />
        {(1===2) && (<BottomNav />)}
	    </div>

		  <div className='modal-wrapper'>
			  {(modals.cookies) && (<CookiesOverlay
				  onConfirmed={this.handleCookies}
				  onComplete={()=> this.onToggleModal(Modals.COOKIES, false)}
			  />)}

			  {(modals.profile) && (<ProfileModal
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.PROFILE, false)}
				  onUpdated={this.handleUpdateUser}
			  />)}

			  {(modals.login) && (<LoginModal
				  inviteID={null}
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.LOGIN, false)}
				  onLoggedIn={this.handleUpdateUser}
			  />)}

			  {(modals.register) && (<RegisterModal
				  inviteID={inviteID}
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.REGISTER, false)}
				  onRegistered={this.handleUpdateUser}
			  />)}

			  {(modals.stripe) && (<StripeModal
				  profile={profile}
				  payload={modals.payload}
				  onPopup={this.handlePopup}
				  onSubmitted={this.handlePurchaseSubmitted}
				  onComplete={()=> this.onToggleModal(Modals.STRIPE, false)}
			  />)}

        {(modals.invite) && (<InviteModal
				  payload={modals.payload}
				  onPopup={this.handlePopup}
				  onSubmitted={this.handlePurchaseSubmitted}
				  onComplete={()=> this.onToggleModal(Modals.INVITE, false)}
			  />)}

			  {/* {(modals.network) && (<AlertDialog
				  title='No Internet Connection'
				  tracking={Modals.NETWORK}
				  onComplete={()=> this.onToggleModal(Modals.NETWORK, false)}>
				  Check your network connection to continue.
			  </AlertDialog>)} */}

			  {(modals.disable) && (<ConfirmDialog
				  title="Delete your account"
				  tracking={Modals.DISABLE}
          filled={true}
          closeable={true}
				  onConfirmed={this.handleDisableAccount}
				  onComplete={()=> this.onToggleModal(Modals.DISABLE, false)}>
				  Are you sure you wish to delete your account? You won't be able to log back in, plus your playgrounds & comments will be removed. Additionally, you will be dropped from your team.
			  </ConfirmDialog>)}

			  {(modals.noAccess) && (<ConfirmDialog
				  tracking={Modals.NO_ACCESS}
					filled={true}
					closeable={true}
					buttons={['OK']}
          onConfirmed={null}
				  onComplete={(ok)=> { this.onToggleModal(Modals.NO_ACCESS, false); (ok) ? this.handleLogout(null, Modals.LOGIN) : this.handleLogout(Pages.HOME) }}>
				  Project has been deleted or permissions have been denied.
			  </ConfirmDialog>)}

			  {(popup) && (<PopupNotification
				  payload={popup}
				  onComplete={()=> this.setState({ popup : null })}>
				  <span dangerouslySetInnerHTML={{ __html : popup.content }} />
			  </PopupNotification>)}
		  </div>
	  </div>);
  }
}

const mapStateToProps = (state, ownProps)=> {
  return {
    darkThemed     : state.darkThemed,
    componentTypes : state.componentTypes,
    products       : state.products,
    profile        : state.userProfile,
    team           : state.team,
    playgrounds    : state.playgrounds,
    playground     : state.playground,
    typeGroup      : state.typeGroup,
    comment        : state.comment,
    matchPath      : state.matchPath
  };
};

const mapDispatchToProps = (dispatch)=> {
  return {
    fetchTeamLookup   : (payload)=> dispatch(fetchTeamLookup(payload)),
    fetchUserProfile  : ()=> dispatch(fetchUserProfile()),
    setPlayground     : (payload)=> dispatch(setPlayground(payload)),
    updateMatchPath   : (payload)=> dispatch(updateMatchPath(payload)),
    updateUserProfile : (payload)=> dispatch(updateUserProfile(payload))
  };
};

// export default connect(mapStateToProps, mapDispatchToProps)(App);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
