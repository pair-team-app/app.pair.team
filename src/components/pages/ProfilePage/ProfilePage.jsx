
import React, { Component } from 'react';
import './ProfilePage.css';

import { goBack } from 'connected-react-router';
import { connect } from 'react-redux';

import BasePage from '../BasePage';
import { POPUP_TYPE_OK } from '../../overlays/PopupNotification';
import ProfileForm from '../../forms/ProfileForm';
import PageNavLink from '../../iterables/PageNavLink';

import { updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';



class ProfilePage extends Component {
	constructor(props) {
		super(props);

		this.state = {};
  }
  componentDidMount() {
    // console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });
  }

  handleCancel = ()=> {
    console.log('%s.handleCancel()', this.constructor.name);
    trackEvent('button', 'profile-cancel');
    this.props.goBack();
  };

  handleSubmit = ({ id, username, email, password, avatar })=> {
    console.log('%s.handleSubmit()', this.constructor.name, { id, username, email, password, avatar });

    trackEvent('button', 'update-profile');

    this.props.onPopup({
      type    : POPUP_TYPE_OK,
      content : 'Profile updated.'
    });

    this.props.updateUserProfile({
      profile : { id, username : email, email, password, avatar },
      remote  : true
    });
  };


  render() {
    console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state });

    const { profile } = this.props;
    return (<BasePage { ...this.props } className="profile-page">
      {(profile) && (<div>
        <ProfileForm
          profile={profile}
          onCancel={this.handleCancel}
          onSubmit={this.handleSubmit}
        />
        <div className="footer">
          {(!profile.validated) && (<div><PageNavLink to="#" onClick={this.handleResendVerify}>Resend Verify Email</PageNavLink></div>)}
          <PageNavLink to="#" onClick={this.handleResetPassword}>Delete Account</PageNavLink>
        </div>
      </div>)}
    </BasePage>);
  }
}



const mapDispatchToProps = (dispatch)=> {
  return ({
    updateUserProfile : (payload)=> dispatch(updateUserProfile(payload)),
    goBack            : (payload)=> dispatch(goBack(payload))
  });
};

const mapStateToProps = (state, ownProps)=> {
  return ({
    profile : state.user.profile,
    teams   : state.user.teams
  });
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
