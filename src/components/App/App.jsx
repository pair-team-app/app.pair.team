
import React, { Component } from 'react';
import './App.css';

import axios from 'axios';
import { push } from 'connected-react-router';
import { Browsers } from 'lang-js-utils';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Routes from '../helpers/Routes';
import AlertDialog from '../overlays/AlertDialog';
import ConfirmDialog from '../overlays/ConfirmDialog';
import InviteModal from '../overlays/InviteModal';
import LoginModal from '../overlays/LoginModal';
import PopupNotification, { POPUP_TYPE_OK } from '../overlays/PopupNotification';
import ProfileModal from '../overlays/ProfileModal';
import RecoverModal from '../overlays/RecoverModal';
import RegisterModal from '../overlays/RegisterModal';
import StripeModal from '../overlays/StripeModal';
import LeftNav from '../sections/LeftNav';
import TopNav from '../sections/TopNav';

import { API_ENDPT_URL, Modals, Pages } from '../../consts/uris';
import { fetchUserTeams, fetchUserProfile, fetchInvite, setPlayground, modifyInvite, paidStripeSession, updateUserProfile } from '../../redux/actions';
// import { makeAvatar } from '../../utils/funcs';
import { initTracker, trackEvent, trackPageview } from '../../utils/tracking';

const MATTY_DEVIN_THEME = false;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      darkTheme : false,
      popup     : null,
      modals    : {
        cookies  : (cookie.load('cookies') << 0) === 0,
        disable  : false,
        expired  : false,
        invite   : false,
        login    : false,
        noAccess : false,
        payment  : false,
        profile  : false,
        recover  : false,
        register : false,
        stripe   : false
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
      // console.log('%s.onpopstate()', this.constructor.name, '-/\\/\\/\\/\\/\\/\\-', this.props.location.pathname, { event });
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state, snapshot });
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state.modals);

    const { location, hash, profile, team, purchase, invite } = this.props;
    const { pathname } = location;
    const { modals } = this.state;


    // url changed
    if (prevProps.location.pathname !== pathname) {
      trackPageview();

    }


    // modal routes
    if (hash.length > 0 && prevProps.hash !== hash) {

      // invite modal
      if (hash === '#invite') {
        this.onToggleModal(Modals.INVITE);
      }

      // recover modal
      if (hash === '#recover') {
        this.onToggleModal(Modals.RECOVER);
      }

      // profile modal
      if (hash === '#profile') {
        this.onToggleModal(Modals.PROFILE);
      }

      // login
      if (hash === '#login') {
        this.onToggleModal(Modals.LOGIN);
      }

      // register
      if (hash === '#register') {
        this.onToggleModal(Modals.REGISTER);
      }
    }

    // has internet
    if (Browsers.isOnline()) {

      // invite page, extract id from url
      if (location.pathname.startsWith(Pages.INVITE) && !invite) {
        const inviteID = location.pathname.split('/')[3] << 0;
        this.props.fetchInvite({ inviteID });
      }

      // post invite fetch
      if (!prevProps.invite && this.props.invite) {
        const { invite } = this.props;

        if (invite.state === 1 || invite.state === 2) {
          axios.post(API_ENDPT_URL, {
            action  : 'USER_LOOKUP',
            payload : {
              email : invite.email
            }
          }).then((response)=> {
            console.log('USER_LOOKUP', response.data);

            const { user } = response.data;
            if (user) {
              this.onToggleModal(Modals.LOGIN);

            } else {
              this.onToggleModal(Modals.REGISTER);
            }

            if (invite.state === 1) {
              this.props.modifyInvite({ invite, state : 2 });
            }
          }).catch((error)=> {});

        } else if (invite.state === 3) {//} && !modals.expired) {
          this.onToggleModal(Modals.EXPIRED);
        }
      }


      // not logged in
      if (!profile) {
        if (!modals.login && !modals.register && !modals.invite && !modals.recover) {
          this.onToggleModal(Modals.LOGIN);
        }


      // logged in
      } else {
        // dismiss reg / login modals after login

        if (modals.login) {
          this.onToggleModal(Modals.LOGIN, false);
        }

        if (modals.register) {
          this.onToggleModal(Modals.REGISTER, false);
        }


        // payment modal
        if (team && team.type === 'free' && !modals.stripe && !modals.profile) {
          if (team.members.filter(({ role })=> (role !== 'bot')).length >= 4) {
            this.onToggleModal(Modals.STRIPE);
          }
        }

        // start payment process
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

        // within team page
        } else if (pathname.startsWith(Pages.TEAM)) {


        }
      }

      // outros from history
      if (hash === '' && prevProps.hash.startsWith('#')) {
        if (prevProps.hash === '#invite') {
          this.onToggleModal(Modals.INVITE, false);
        }

        if (prevProps.hash === '#profile') {
          this.onToggleModal(Modals.PROFILE, false);
        }

        if (prevProps.hash === '#recover') {
          this.onToggleModal(Modals.RECOVER, false);
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

    axios.post(API_ENDPT_URL, {
      action  : 'DISABLE_ACCOUNT',
      payload : { user_id: profile.id }
    }).then((response)=> {
      // console.log('DISABLE_ACCOUNT', response.data);

      trackEvent('user', 'delete-account');
      this.props.updateUserProfile({ profile : null });
      this.props.history.push(Pages.HOME);
    }).catch((error)=> {});
  };

  handleLogout = (page=Pages.TEAM, modal=Modals.LOGIN)=> {
    console.log('%s.handleLogout()', this.constructor.name, this.constructor.name, { page, modal });
    trackEvent('user', 'sign-out');

    this.props.updateUserProfile({ profile : null });

    if (page) {
      this.props.history.push(page);
    }

    if (modal) {
      this.onToggleModal(modal);
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
    // console.log('%s.handleThemeToggle()', this.constructor.name, { event });
    this.setState({ darkTheme : !this.state.darkTheme });
  };

  handleUpdateUser = (profile)=> {
    console.log('%s.handleUpdateUser()', this.constructor.name, profile);
    this.props.updateUserProfile({ profile, remote : true });
  };

  onToggleModal = (uri, show=true, clear=true)=> {
    console.log('%s.onToggleModal()', this.constructor.name, { uri, show, clear, modals : this.state.modals });

    const { hash } = this.props;
    const { modals } = this.state;

    if (show) {
      if (hash !== uri) {
        this.props.push(`${window.location.pathname}${uri}`);
      }

      this.setState({
        modals : { ...modals,
          disable  : uri === Modals.DISABLE,
          login    : uri === Modals.LOGIN,
          invite   : uri === Modals.INVITE,
          expired  : uri === Modals.EXPIRED,
          noAccess : uri === Modals.NO_ACCESS,
          payment  : uri === Modals.PAYMENT,
          profile  : uri === Modals.PROFILE,
          recover  : uri === Modals.RECOVER,
          register : uri === Modals.REGISTER,
          stripe   : uri === Modals.STRIPE
        }
      });

    } else {
      if (hash === uri && clear) {
        this.props.push(window.location.pathname.replace(uri, ''));
      }

      this.setState({
        modals : { ...modals,
          cookies  : (uri === Modals.COOKIES) ? false : modals.cookies,
          disable  : (uri === Modals.DISABLE) ? false : modals.disable,
          invite   : (uri === Modals.INVITE) ? false : modals.invite,
          login    : (uri === Modals.LOGIN) ? false : modals.login,
          noAccess : (uri === Modals.NO_ACCESS) ? false : modals.noAccess,
          payment  : (uri === Modals.PAYMENT) ? false : modals.payment,
          profile  : (uri === Modals.PROFILE) ? false : modals.profile,
          recover  : (uri === Modals.RECOVER) ? false : modals.recover,
          register : (uri === Modals.REGISTER) ? false : modals.register,
          stripe   : (uri === Modals.STRIPE) ? false : modals.stripe,
          payload  : null
        }
      });
    }
  };

  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props, matchPlaygrounds });
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });
    // console.log('%s.render()', this.constructor.name, this.state.modals);

    const { darkThemed, profile, team, purchase } = this.props;
    const { popup, modals } = this.state;

    return (<div className="site-wrapper" data-theme={(darkThemed) ? 'dark' : 'light'} data-devin-matty={MATTY_DEVIN_THEME}>
      <LeftNav />
	    <div className="page-wrapper">
        <TopNav darkTheme={darkThemed} onToggleTheme={this.handleThemeToggle} onLogout={this.handleLogout} onModal={this.onToggleModal} onPopup={this.handlePopup} />
		    <Routes onLogout={this.handleLogout} onModal={this.onToggleModal} onPopup={this.handlePopup} { ...this.props } />
	    </div>

		  <div className='modal-wrapper'>
        {/* <ModalRoutes modals={modals} onComplete={this.handeModalComplete} /> */}

        {(modals.profile) && (<ProfileModal
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  onComplete={()=> this.onToggleModal(Modals.PROFILE, false)}
				  onUpdated={this.handleUpdateUser}
			  />)}

			  {(modals.login) && (<LoginModal
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  // onComplete={()=> this.onToggleModal(Modals.LOGIN, false)}
				  onComplete={()=> this.setState({ modals : { ...modals, login : false }})}
			  />)}

        {(modals.recover) && (<RecoverModal
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  // onComplete={()=> this.onToggleModal(Modals.RECOVER, false)}
				  onComplete={()=> this.setState({ modals : { ...modals, recover : false }})}
			  />)}

			  {(modals.register) && (<RegisterModal
				  onModal={(uri)=> this.onToggleModal(uri, true)}
				  onPopup={this.handlePopup}
				  // onComplete={()=> this.onToggleModal(Modals.REGISTER, false)}
				  onComplete={()=> this.setState({ modals : { ...modals, register : false }})}
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
				  onComplete={(ok)=> { this.onToggleModal(Modals.NO_ACCESS, false); (ok) ? this.handleLogout() : this.handleLogout() }}>
				  Project has been deleted or permissions have been denied.
			  </ConfirmDialog>)}

        {(modals.payment) && (<AlertDialog
				  title='Payment Processed'
				  tracking={Modals.PAYMENT}
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
    matchPath      : state.matchPath,
    hash           : state.router.location.hash
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
    updateUserProfile : (payload)=> dispatch(updateUserProfile(payload)),
    push              : (payload)=> dispatch(push(payload))
  };
};

// export default connect(mapStateToProps, mapDispatchToProps)(App);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
