
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import { Browsers } from 'lang-js-utils';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { matchPath, withRouter } from 'react-router-dom';

import Routes, { RoutePaths } from '../helpers/Routes';
import ModalRoutes from '../helpers/ModalRoutes';
import AlertDialog from '../overlays/AlertDialog';
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
import { fetchUserTeams, fetchUserProfile, fetchInvite, setPlayground, modifyInvite, paidStripeSession, updateUserProfile } from '../../redux/actions';
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
        cookies  : (cookie.load('cookies') << 0) === 0,
        disable  : false,
        expired  : false,
        invite   : false,
        login    : false,
        noAccess : false,
        payment  : false,
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
    if (location.pathname.startsWith(Pages.INVITE)) {
      if (profile) {
        this.onLogout();
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

    const { location, profile, team, playgrounds, playground, purchase } = this.props;
    const { pathname, hash } = location;
    const { modals } = this.state;

    // url changed
    if (prevProps.location.pathname !== pathname) {
      trackPageview();
    }

    // has internet
    if (Browsers.isOnline()) {
      if (location.pathname.startsWith(Pages.INVITE) && !this.state.inviteID && !modals.register) {
        const inviteID = location.pathname.split('/')[3] << 0;
        this.setState({ inviteID }, ()=> {
          //
        });
      }

      if (!prevState.inviteID && this.state.inviteID) {
        const { inviteID } = this.state;
        this.props.fetchInvite({ inviteID });
      }

      if (!prevProps.invite && this.props.invite) {
        const { invite } = this.props;


        if (invite.state === 1 || invite.state === 2) {
          axios.post(API_ENDPT_URL, {
            action  : 'USER_LOOKUP',
            payload : {
              email : invite.email
            }
          }).then((response)=> {
            // console.log('USER_LOOKUP', response.data);

            const { user } = response.data;
            if (user) {
              this.onToggleModal(Modals.REGISTER);

            } else {
              this.onToggleModal(Modals.LOGIN);
            }

            if (invite.state === 1) {
              this.props.modifyInvite({ invite, state : 2 });
            }
          }).catch((error)=> {});

        } else if (invite.state === 3) {//} && !modals.expired) {
          this.onToggleModal(Modals.EXPIRED);
        }
      }


      if (profile && team && team.type == 'free' && !modals.stripe) {
        if (team.members.length >= 2) {
          this.onToggleModal(Modals.STRIPE);
        }
      }


      // if (products && team !== null && prevProps.team === null) {
      //   const modal = (team.members.length > 10 && team.type === 'free') || (team.members.length > 50 && team.type !== 'enterprise');
      //   if (modal && !prevState.modals.stripe && !modals.stripe) {
      //     const product = products.find(({ threshold })=> team.members.length >= threshold);
      //     this.onToggleModal(Modals.STRIPE, true, { team, product });
      //   }
      // }

      if (location.pathname.startsWith(Pages.PAYMENT)) {
        if (profile) {
          const sessionID = pathname.split('/').pop();

          if (!purchase) {
            this.props.paidStripeSession({ sessionID });

          } else {
            if (!prevProps.purchase && purchase && !modals.payment) {
              this.onToggleModal(Modals.PAYMENT);
            }
          }
        }

      } else if (pathname.startsWith(Pages.TEAM)) {
        if (!profile && !modals.login && !modals.register && !modals.payment) {
          this.onToggleModal(Modals.LOGIN);
        }
      }

      // dismiss login modal after profile
      if (profile !== null && modals.login) {
        this.onToggleModal(Modals.LOGIN, false);
      }


      // dismiss register modal after profile
      if (profile !== null && modals.register) {
        this.onToggleModal(Modals.REGISTER, false);
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

    axios.post(API_ENDPT_URL, {
      action  : 'DISABLE_ACCOUNT',
      payload : { user_id: profile.id }
    }).then((response)=> {
      // console.log('DISABLE_ACCOUNT', response.data);

      trackEvent('user', 'delete-account');
      this.props.updateUserProfile(null);
      this.props.history.push(Pages.HOME);
    }).catch((error)=> {});
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

  handleModalComplete = (uri)=> {
    console.log('%s.handleModalComplete()', this.constructor.name, { uri });
    this.onToggleModal(uri, false);
  };

  handlePopup = (payload)=> {
    // console.log('%s.handlePopup()', this.constructor.name, payload);
    this.setState({ popup : payload });
  };

  handlePurchaseSubmitted = (purchase)=> {
    // console.log('%s.handlePurchaseSubmitted()', this.constructor.name, purchase);

    this.onToggleModal(Modals.STRIPE, false);

    this.props.fetchUserProfile();
    const { profile } = this.props;
    this.props.fetchUserTeams({ profile });
  };

  handleThemeToggle = (event)=> {
    // console.log('%s.handleThemeToggle()', this.constructor.name, event);
    this.setState({ darkTheme : !this.state.darkTheme });
  };

  handleUpdateUser = (profile)=> {
    console.log('%s.handleUpdateUser()', this.constructor.name, profile);
    this.props.updateUserProfile(profile);
  };

  onToggleModal = (uri, show=true, payload=null)=> {
    console.log('%s.onToggleModal()', this.constructor.name, uri, show, payload, this.state.modals);
    const { modals } = this.state;

    if (show) {
      this.setState({
        modals : { ...modals, payload,
          disable  : uri === Modals.DISABLE,
          login    : uri === Modals.LOGIN,
          invite   : uri === Modals.INVITE,
          expired  : uri === Modals.EXPIRED,
          noAccess : uri === Modals.NO_ACCESS,
          payment  : uri === Modals.PAYMENT,
          profile  : uri === Modals.PROFILE,
          register : uri === Modals.REGISTER,
          stripe   : uri === Modals.STRIPE
        }
      });
    } else {
      this.setState({
        modals : { ...modals,
          cookies  : (uri === Modals.COOKIES) ? false : modals.cookies,
          disable  : (uri === Modals.DISABLE) ? false : modals.disable,
          invite   : (uri === Modals.INVITE) ? false : modals.invite,
          login    : (uri === Modals.LOGIN) ? false : modals.login,
          noAccess : (uri === Modals.NO_ACCESS) ? false : modals.noAccess,
          payment  : (uri === Modals.PAYMENT) ? false : modals.payment,
          profile  : (uri === Modals.PROFILE) ? false : modals.profile,
          register : (uri === Modals.REGISTER) ? false : modals.register,
          stripe   : (uri === Modals.STRIPE) ? false : modals.stripe,
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

    const { darkThemed, profile, location, team, purchase } = this.props;
    const { popup, inviteID, modals } = this.state;

    const { pathname } = location;

    return (<div className="site-wrapper" data-theme={(darkThemed) ? 'dark' : 'light'} data-devin-matty={MATTY_DEVIN_THEME}>
      {/* {(!matchPlaygrounds) && (<TopNav darkTheme={darkThemed} onToggleTheme={this.handleThemeToggle} onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} />)} */}
      <LeftNav />


	    {/* <div className={`page-wrapper${(location.pathname.startsWith(Pages.PROJECT) && !location.pathname.includes(Pages.TEAM)) ? ' playground-page-wrapper' : ''}`}> */}
	    {/* <div className="page-wrapper"> */}
	    <div className="page-wrapper">
        <TopNav darkTheme={darkThemed} onToggleTheme={this.handleThemeToggle} onModal={this.onToggleModal} />
		    <Routes onLogout={this.handleLogout} onModal={this.onToggleModal} onPopup={this.handlePopup} { ...this.props } />
        {(1===2) && (<BottomNav />)}
	    </div>

		  <div className='modal-wrapper'>
        <ModalRoutes modals={modals} onComplete={this.handeModalComplete} />


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

			  {(modals.expired) && (<AlertDialog
				  title='Invite Expired'
				  tracking={Modals.EXPIRED}
				  onComplete={()=> this.onToggleModal(Modals.EXPIRED, false)}>
				  This invite has expired.
			  </AlertDialog>)}

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

        {(modals.payment) && (<AlertDialog
				  title='Payment Processed'
				  tracking={Modals.PAYMENT}
				  // onComplete={()=> { this.onToggleModal(Modals.PAYMENT, false); window.location.pathname = `${Pages.TEAM}/${team.id}--${team.slug}` }}>
				  onComplete={()=> { this.onToggleModal(Modals.PAYMENT, false); this.props.history.replace(`${Pages.TEAM}/${team.id}--${team.slug}`) }}>
				  Your team <strong>{team.title} - [{team.id}]</strong> is now a paid {purchase.type} plan.
			  </AlertDialog>)}

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
    componentTypes : state.builds.componentTypes,
    invite         : state.teams.invite,
    purchase       : state.purchase,
    products       : state.products,
    profile        : state.user.profile,
    team           : state.teams.team,
    playgrounds    : state.builds.playgrounds,
    playground     : state.builds.playground,
    typeGroup      : state.builds.typeGroup,
    comment        : state.comments.comment,
    matchPath      : state.matchPath
  };
};

const mapDispatchToProps = (dispatch)=> {
  return {
    fetchInvite       : (payload)=> dispatch(fetchInvite(payload)),
    fetchUserTeams    : (payload)=> dispatch(fetchUserTeams(payload)),
    fetchUserProfile  : ()=> dispatch(fetchUserProfile()),
    setPlayground     : (payload)=> dispatch(setPlayground(payload)),
    modifyInvite      : (payload)=> dispatch(modifyInvite(payload)),
    paidStripeSession : (payload)=> dispatch(paidStripeSession(payload)),
    updateUserProfile : (payload)=> dispatch(updateUserProfile(payload))
  };
};

// export default connect(mapStateToProps, mapDispatchToProps)(App);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
