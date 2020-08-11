
import React, { Component } from 'react';
// import { Route, Switch, withRouter } from 'react-router-dom';

import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import AlertDialog from '../../overlays/AlertDialog';
import ConfirmDialog from '../../overlays/ConfirmDialog';
// import CookiesOverlay from '../../overlays/CookiesOverlay';
import LoginModal from '../../overlays/LoginModal';
import ProfileModal from '../../overlays/ProfileModal';
import RegisterModal from '../../overlays/RegisterModal';
import StripeModal from '../../overlays/StripeModal';

import { Pages, Modals } from '../../../consts/uris';



class ModalRoutes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cookies  : (cookie.load('cookies') << 0 === 0),
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
    };
  }

  componentDidMount() {
		// console.log('%s.componentDidMount()-', this.constructor.name, this.props, this.state);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);
  }



  onToggleModal = (uri, show=true, payload=null)=> {
    console.log('%s.onToggleModal()', this.constructor.name, uri, show, payload, this.state.modals);
    const { modals } = this.state;

    if (show) {
      this.setState({ ...this.state,
        disable  : uri === Modals.DISABLE,
        login    : uri === Modals.LOGIN,
        invite   : uri === Modals.INVITE,
        expired  : uri === Modals.EXPIRED,
        noAccess : uri === Modals.NO_ACCESS,
        payment  : uri === Modals.PAYMENT,
        profile  : uri === Modals.PROFILE,
        register : uri === Modals.REGISTER,
        stripe   : uri === Modals.STRIPE
      });
    } else {
      this.setState({ ...this.state,
        cookies  : (uri === Modals.COOKIES) ? false : modals.cookies,
        disable  : (uri === Modals.DISABLE) ? false : modals.disable,
        invite   : (uri === Modals.INVITE) ? false : modals.invite,
        login    : (uri === Modals.LOGIN) ? false : modals.login,
        noAccess : (uri === Modals.NO_ACCESS) ? false : modals.noAccess,
        payment  : (uri === Modals.PAYMENT) ? false : modals.payment,
        profile  : (uri === Modals.PROFILE) ? false : modals.profile,
        register : (uri === Modals.REGISTER) ? false : modals.register,
        stripe   : (uri === Modals.STRIPE) ? false : modals.stripe
      });
    }
  };




  render() {
    // console.log('%s.render()', this.constructor.name, { props : this.props });

    const { inviteID, purchase, team } = this.props;
    const { cookies, profile, login, register, stripe, invite, expired, disable, noAccess, payment } = this.state;

    return (<Switch>
      {(profile) && (<ProfileModal
        onModal={(uri)=> this.onToggleModal(uri, true)}
        onPopup={this.handlePopup}
        onComplete={()=> this.props.onComplete(Modals.PROFILE)}
        onUpdated={this.handleUpdateUser}
      />)}

      {(login) && (<LoginModal
        inviteID={null}
        onModal={(uri)=> this.onToggleModal(uri, true)}
        onPopup={this.handlePopup}
        onComplete={()=> this.props.onComplete(Modals.LOGIN)}
        onLoggedIn={this.handleUpdateUser}
      />)}

      {(register) && (<RegisterModal
        inviteID={inviteID}
        onModal={(uri)=> this.onToggleModal(uri, true)}
        onPopup={this.handlePopup}
        onComplete={()=> this.props.onComplete(Modals.REGISTER)}
        onRegistered={this.handleUpdateUser}
      />)}

      {(stripe) && (<StripeModal
        profile={profile}
        onPopup={this.handlePopup}
        onSubmitted={this.handlePurchaseSubmitted}
        onComplete={()=> this.props.onComplete(Modals.STRIPE)}
      />)}

      {(expired) && (<AlertDialog
        title='Invite Expired'
        tracking={Modals.EXPIRED}
        onComplete={()=> this.props.onComplete(Modals.EXPIRED)}>
        This invite has expired.
      </AlertDialog>)}

      {(disable) && (<ConfirmDialog
        title="Delete your account"
        tracking={Modals.DISABLE}
        filled={true}
        closeable={true}
        onConfirmed={this.handleDisableAccount}
        onComplete={()=> this.props.onComplete(Modals.DISABLE)}>
        Are you sure you wish to delete your account? You won't be able to log back in, plus your playgrounds & comments will be removed. Additionally, you will be dropped from your team.
      </ConfirmDialog>)}

      {(noAccess) && (<ConfirmDialog
        tracking={Modals.NO_ACCESS}
        filled={true}
        closeable={true}
        buttons={['OK']}
        onConfirmed={null}
        onComplete={(ok)=> {
          this.props.onComplete(Modals.NO_ACCESS);
          (ok) ? this.handleLogout(null, Modals.LOGIN) : this.handleLogout(Pages.HOME)
        }}>
          Project has been deleted or permissions have been denied.
      </ConfirmDialog>)}

      {(payment) && (<AlertDialog
        title='Payment Processed'
        tracking={Modals.PAYMENT}
        onComplete={()=> { this.props.onComplete(Modals.PAYMENT);
        this.props.history.replace(`${Pages.TEAM}/${team.id}--${team.slug}`)
      }}>
        Your team <strong>{team.title} - [{team.id}]</strong> is now a paid {purchase.type} plan.
      </AlertDialog>)}
    </Switch>);
  }
}



const mapStateToProps = (state, ownProps)=> {
  return ({
    purchase : state.purchase,
    team     : state.team
  });
};

export default connect(mapStateToProps, null)(ModalRoutes);
// export default withRouter(ModalRoutes);
