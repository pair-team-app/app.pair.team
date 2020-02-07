import axios from "axios";
import { Browsers, DateTimes } from "lang-js-utils";
import React, { Component } from "react";
import cookie from "react-cookies";
import { connect } from "react-redux";
import { API_ENDPT_URL, GITHUB_APP_AUTH, Modals, Pages } from "../../consts/uris";
import { fetchBuildPlaygrounds, fetchTeamLookup, fetchTeamPlaygroundsSummary, fetchUserProfile, setPlayground, updateMouseCoords, updatePathname, updateUserProfile, setTypeGroup } from "../../redux/actions";
import { initTracker, trackEvent, trackPageview } from "../../utils/tracking";
import Routes from "../helpers/Routes";
import AlertDialog from "../overlays/AlertDialog";
import ConfirmDialog from "../overlays/ConfirmDialog";
import CookiesOverlay from "../overlays/CookiesOverlay";
import LoginModal from "../overlays/LoginModal";
import PopupNotification from "../overlays/PopupNotification";
import ProfileModal from "../overlays/ProfileModal";
import RegisterModal from "../overlays/RegisterModal";
import StripeModal from "../overlays/StripeModal";
import BottomNav from '../sections/BottomNav';
import TopNav from '../sections/TopNav';
import "./App.css";
import { withRouter, matchPath } from 'react-router-dom';
import { typeGroupByID, typeGroupByKey } from "../pages/PlaygroundPage/utils/lookup";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authID: 0,
      darkTheme: false,
      popup: null,
      modals: {
        cookies: cookie.load("cookies") << 0 === 0,
        // 				cookies  : false, // disable
        disable: false,
        github: false,
        login: false,
        network: !Browsers.isOnline(),
        noAccess: false,
        profile: false,
        register: false,
        stripe: false,
        payload: null
      }
    };

    this.githubWindow = null;
    this.authInterval = null;

    initTracker(cookie.load("user_id"));
  }

  componentDidMount() {
    		console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });

    trackEvent("site", "load");
    trackPageview();
    //-/>
    // console.log('[:][:][:][:][:][:][:][:][:][:]');

    const { profile, location } = this.props;
    // 		if (!profile && location.pathname.startsWith(Pages.PLAYGROUND)) {
    if (
      !profile &&
      location.pathname.startsWith(Pages.PLAYGROUND) &&
      cookie.load("user_id") === "0"
    ) {
      this.onToggleModal(Modals.LOGIN);
    }

    window.addEventListener("mousemove", this.handleMouseMove);
    window.onpopstate = event => {
      event.preventDefault();
      //-/> 			console.log('%s.onpopstate()', this.constructor.name, '-/\\/\\/\\/\\/\\/\\-', this.props.location.pathname, event);
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state, snapshot });
    // 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state.modals);

    const matchPlaygrounds = matchPath(this.props.location.pathname, {
      path : `${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:playgroundID([0-9]+)?/:componentsSlug([A-Za-z-]+)?/:componentID([0-9]+)?/(accessibility)?/(comments)?/:commentID([0-9]+)?`,
      exact : false,
      strict: false
    });


    const { componentTypes, profile, team, playgrounds, playground, typeGroup } = this.props;
    const { pathname } = this.props.location;
    const { teamSlug,
      projectSlug,
      buildID,
      playgroundID,
      componentsSlug,
      componentID,
      commentID } = matchPlaygrounds.params;
    const { modals } = this.state;

    		// console.log('|:|:|:|:|:|:|:|:|:|:|:|', { matchPlaygrounds });
    //  console.log('|:|:|:|:|:|:|:|:|:|:|:|', { prevPathname : prevProps.location.pathname, currPathname : pathname, state : this.state });
    if (prevProps.location.pathname !== pathname) {
      trackPageview();
    }

    if (profile !== null && prevProps.profile === null) {
      this.onToggleModal(Modals.LOGIN, false);
      this.props.fetchTeamLookup({ userID: profile.id });
    }

    if (team !== null && prevProps.team === null) {
      // console.log("|:|:|:|:|:|:|:|:|:|:|:|", "FETCH TEAM PLAYGROUND SUMMARY");

      const modal =
        (team.members.length > 10 && team.type === "free") ||
        (team.members.length > 50 && team.type !== "enterprise");
      if (modal && !prevState.modals.stripe && !modals.stripe) {
        const product = this.props.products.find(
          ({ threshold }) => team.members.length >= threshold
        );
        this.onToggleModal(Modals.STRIPE, true, { team, product });
      }

      this.props.fetchTeamPlaygroundsSummary({ team });
    }

    if (playgrounds !== null && prevProps.playgrounds === null && buildID) {
      this.props.fetchBuildPlaygrounds({ buildID : buildID << 0, playgroundID : playgroundID << 0 });
    }

    console.log('..|..|..|..|', { componentTypes, typeGroup, componentsSlug });

    if (componentTypes && (!typeGroup && componentsSlug || typeGroup.key !== componentsSlug)) {
      console.log("|:|:|:|:|:|:|:|:|:|:|:|", "SET TYPE GROUP", { matchPlaygrounds, buildID });
      const typeGroup = typeGroupByKey(this.props.componentTypes, componentsSlug);
      this.props.setTypeGroup(typeGroup);
    }

    // if (pathname.startsWith(Pages.PLAYGROUND)) {
    //   if (!prevProps.location.pathname.startsWith(Pages.PLAYGROUND)) {
    //     this.props.setPlayground(null);

    //     if (!profile) {
    //       this.onToggleModal(Modals.LOGIN);
    //     }
    //   }
    // }

    if (
      profile &&
      team &&
      playground && team.id << 0 !== playground.team.id << 0 &&
      !prevState.modals.noAccess &&
      !modals.noAccess
    ) {     
        this.onToggleModal(Modals.NO_ACCESS);
      }

    if (!prevState.modals.network && !modals.network && !Browsers.isOnline()) {
      this.onToggleModal(Modals.NETWORK);
    }
  }

  componentWillUnmount() {
    //-/> 		console.log('%s.componentWillUnmount()', this.constructor.name);

    if (this.authInterval) {
      clearInterval(this.authInterval);
    }

    if (this.githubWindow) {
      this.githubWindow.close();
    }

    this.authInterval = null;
    this.githubWindow = null;

    window.onpopstate = null;
    window.removeEventListener("mousemove", this.handleMouseMove);
  }

  handleCookies = () => {
    // 		console.log('%s.handleCookies()', this.constructor.name);
    this.onToggleModal(Modals.COOKIES, false);
    cookie.save("cookies", "1", { path: "/", sameSite: false });
  };

  handleDisableAccount = () => {
    // 		console.log('%s.handleDisableAccount()', this.constructor.name);

    const { profile } = this.props;

    axios
      .post(API_ENDPT_URL, {
        action: "DISABLE_ACCOUNT",
        payload: { user_id: profile.id }
      })
      .then(response => {
        //-/> 			console.log('DISABLE_ACCOUNT', response.data);

        trackEvent("user", "delete-account");
        this.props.updateUserProfile(null);
        this.props.history.push(Pages.HOME);
      })
      .catch(error => {});
  };

  handleGithubAuth = () => {
    //-/> 		console.log('%s.handleGithubAuth()', this.constructor.name);

    const code = DateTimes.epoch(true);
    axios
      .post(API_ENDPT_URL, {
        action: "GITHUB_AUTH",
        payload: { code }
      })
      .then(response => {
        //-/> 			console.log('GITHUB_AUTH', response.data);
        const authID = response.data.auth_id << 0;
        this.setState({ authID }, () => {
          if (
            !this.githubWindow ||
            this.githubWindow.closed ||
            this.githubWindow.closed === undefined
          ) {
            clearInterval(this.authInterval);
            this.authInterval = null;
            this.githubWindow = null;
          }

          const size = {
            width: Math.min(460, window.screen.width - 20),
            height: Math.min(820, window.screen.height - 25)
          };

          this.githubWindow = window.open(
            GITHUB_APP_AUTH.replace("__{EPOCH}__", code),
            "",
            `titlebar=no, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${
              size.width
            }, height=${size.height}, top=${((window.screen.height -
              size.height) *
              0.5) <<
              0}, left=${((window.screen.width - size.width) * 0.5) << 0}`
          );
          this.authInterval = setInterval(() => {
            this.onAuthInterval();
          }, 1000);
        });
      })
      .catch(error => {});
  };

  handleGitHubAuthSynced = (profile, register = true) => {
    //-/> 		console.log('%s.handleGitHubAuthSynced()', this.constructor.name, profile, register);

    this.props.updateUserProfile(profile);

    axios
      .post(API_ENDPT_URL, {
        action: "REGISTER",
        payload: {
          username: profile.email,
          email: profile.email,
          type: "free_user"
        }
      })
      .then(response => {
        //-/> 			console.log('REGISTER', response.data);
      })
      .catch(error => {});
  };

  handleLogout = (page = null, modal = null) => {
    //-/> 		console.log('%s.handleLogout()', this.constructor.name, this.constructor.name, page, modal);
    trackEvent("user", "sign-out");

    this.props.updateUserProfile(null);

    if (modal) {
      this.onToggleModal(modal);
    }

    if (page) {
      this.props.history.push(page);
    }
  };

  handleMouseMove = event => {
    // 		console.log('%s.handleMouseMove()', this.constructor.name, this.constructor.name, { x : event.pageX, y : event.pageY });

    const { location } = this.props;
    if (this.props.profile && location.pathname.startsWith(Pages.PLAYGROUND)) {
      this.props.updateMouseCoords({
        x: event.pageX,
        y: event.pageY
      });
    }
  };

  handlePopup = payload => {
    // 		console.log('%s.handlePopup()', this.constructor.name, payload);
    this.setState({ popup: payload });
  };

  handlePurchaseSubmitted = purchase => {
    // 		console.log('%s.handlePurchaseSubmitted()', this.constructor.name, purchase);

    this.onToggleModal(Modals.STRIPE, false);

    const { profile } = this.props;
    this.props.fetchUserProfile();
    this.props.fetchTeamLookup({ userID: profile.id });
  };

  handleThemeToggle = event => {
    //-/> 		console.log('%s.handleThemeToggle()', this.constructor.name, event);
    this.setState({ darkTheme: !this.state.darkTheme });
  };

  handleUpdateUser = profile => {
    // 		console.log('%s.handleUpdateUser()', this.constructor.name, profile);
    this.props.updateUserProfile(profile);
  };

  onAuthInterval = () => {
    // 		console.log('%s.onAuthInterval()', this.constructor.name);

    if (
      !this.githubWindow ||
      this.githubWindow.closed ||
      this.githubWindow.closed === undefined
    ) {
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

      axios
        .post(API_ENDPT_URL, {
          action: "GITHUB_AUTH_CHECK",
          payload: { authID }
        })
        .then(response => {
          //-/> 				console.log('GITHUB_AUTH_CHECK', response.data);
          const { user } = response.data;
          if (user) {
            trackEvent("github", "success");
            clearInterval(this.authInterval);
            this.authInterval = null;
            this.githubWindow.close();
            this.githubWindow = null;
            this.handleGitHubAuthSynced(user);
          }
        })
        .catch(error => {});
    }
  };

  onToggleModal = (uri, show = true, payload = null) => {
    // 		console.log('%s.onToggleModal()', this.constructor.name, uri, show, payload, this.state.modals);
    const { modals } = this.state;

    if (show) {
      this.setState({
        modals: {
          ...modals,
          payload,
          github: false,
          disable: uri === Modals.DISABLE,
          login: uri === Modals.LOGIN,
          network: uri === Modals.NETWORK,
          noAccess: uri === Modals.NO_ACCESS,
          profile: uri === Modals.PROFILE,
          register: uri === Modals.REGISTER,
          stripe: uri === Modals.STRIPE
        }
      });
    } else {
      this.setState({
        modals: {
          ...modals,
          cookies: uri === Modals.COOKIES ? false : modals.cookies,
          disable: uri === Modals.DISABLE ? false : modals.disable,
          github: uri === Modals.GITHUB ? false : modals.github,
          login: uri === Modals.LOGIN ? false : modals.login,
          network: uri === Modals.NETWORK ? false : modals.network,
          noAccess: uri === Modals.NO_ACCESS ? false : modals.noAccess,
          profile: uri === Modals.PROFILE ? false : modals.profile,
          register: uri === Modals.REGISTER ? false : modals.register,
          stripe: uri === Modals.STRIPE ? false : modals.stripe,
          payload: null
        }
      });
    }
  };

  render() {


    const matchPlaygrounds = matchPath(this.props.location.pathname, {
      path : `${Pages.PLAYGROUND}/:teamSlug([a-z-]+)/:projectSlug([a-z-]+)?/:buildID([0-9]+)?/:playgroundID([0-9]+)?/:componentsSlug([A-Za-z-]+)?/:componentID([0-9]+)?/(accessibility)?/(comments)?/:commentID([0-9]+)?`,
      exact : false,
      strict: false
    });



      	console.log('%s.render()', this.constructor.name, { props : this.props, matchPlaygrounds });
    //   	console.log('%s.render()', this.constructor.name, this.state.modals);

    const { darkThemed, profile, team, location } = this.props;
    const { popup, modals } = this.state;




    return (<div className={`site-wrapper${(darkThemed) ? ' site-wrapper-dark' : ''}`} data-devin-matty={true}>
      
      {(!matchPlaygrounds) && (
        <TopNav darkTheme={darkThemed} onToggleTheme={this.handleThemeToggle} onModal={(uri, payload)=> this.onToggleModal(uri, true, payload)} />
      )}

	    <div className={`page-wrapper${(location.pathname.startsWith(Pages.PLAYGROUND)) ? ' playground-page-wrapper' : ''}`}>
		    <Routes onLogout={this.handleLogout} onModal={this.onToggleModal} onPopup={this.handlePopup} />
	    </div>
		  
      {(!matchPlaygrounds) && (
        <BottomNav />
      )}







		  <div className="modal-wrapper">
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
				  inviteID={null}
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

			  {(modals.network) && (<AlertDialog
				  title="No Internet Connection"
				  tracking={Modals.NETWORK}
				  onComplete={()=> this.onToggleModal(Modals.NETWORK, false)}>
				  Check your network connection to continue.
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

			  {(popup) && (<PopupNotification
				  payload={popup}
				  onComplete={()=> this.setState({ popup : null })}>
				  <span dangerouslySetInnerHTML={{ __html : popup.content }} />
			  </PopupNotification>)}
		  </div>
	  </div>);
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    darkThemed: state.darkThemed,
    componentTypes: state.componentTypes,
    profile: state.userProfile,
    products: state.products,
    team: state.team,
    playgrounds: state.playgrounds,
    playground: state.playground,
    typeGroup: state.typeGroup
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTeamLookup: payload => dispatch(fetchTeamLookup(payload)),
    fetchTeamPlaygroundsSummary: payload => dispatch(fetchTeamPlaygroundsSummary(payload)),
    fetchBuildPlaygrounds: payload => dispatch(fetchBuildPlaygrounds(payload)),
    fetchUserProfile: () => dispatch(fetchUserProfile()),
    setTypeGroup: (payload)=> dispatch(setTypeGroup(payload)),
    setPlayground: payload => dispatch(setPlayground(payload)),
    updateMouseCoords: payload => dispatch(updateMouseCoords(payload)),
    updateUserProfile: profile => dispatch(updateUserProfile(profile))
  };
};

// export default connect(mapStateToProps, mapDispatchToProps)(App);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
