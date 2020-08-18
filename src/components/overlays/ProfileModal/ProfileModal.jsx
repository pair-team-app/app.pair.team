import React, { Component } from 'react';
import './ProfileModal.css';

import axios from 'axios';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import ProfileForm from '../../forms/ProfileForm/ProfileForm';
import { POPUP_TYPE_STATUS, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL, Pages, Modals } from '../../../consts/uris';
import { fetchUserTeams, fetchUserProfile, updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';

class ProfileModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outro      : false,
      outroURI   : null,
      updated    : false,
      submitting : false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state, snapshot });

    const { profile } = this.props;
    if (profile !== prevProps.profile && profile.status === 0x00) {
      this.setState({
        outro   : true,
        updated : true
      });
    }
  }

  handleCancel = ()=> {
    console.log('%s.handleCancel()', this.constructor.name);
    trackEvent('button', 'profile-cancel');

    this.setState({
      outro   : true,
      updated : false
    });
  };

  handleComplete = ()=> {
    console.log('%s.handleComplete()', this.constructor.name, this.state);

    const { updated } = this.state;
    if (updated) {
      this.props.onPopup({
        type    : POPUP_TYPE_OK,
        content : 'Profile updated.',
        delay   : 333
      });

    } else {
      this.props.onPopup({
        type    : POPUP_TYPE_STATUS,
        content : 'No profile changes made.',
        delay   : 333
      });
    }

    this.setState({ outro : false }, ()=> {
      const { outroURI } = this.state;

      if (outroURI) {
        this.props.onModal(outroURI);
      }

      this.props.onComplete();
    });
  };

  handleResendVerify = ()=> {
    console.log('%s.handleResendVerify()', this.constructor.name);

    const { profile } = this.props;
    axios.post(API_ENDPT_URL, {
      action  : 'RESEND_VERIFY',
      payload : {
        user_id : profile.id
      }
    }).then((response)=> {
      console.log('[=|-]', 'RESEND_VERIFY', response.data);
      const { verify } = response.data;
      console.log({ verify });

    }).catch((error)=> {});
  }

  handleResetPassword = ()=> {
    console.log('%s.handleResetPassword()', this.constructor.name);
    this.setState({
      outro    : true,
      outroURI : Modals.RECOVER
    });
  };

  handleSubmit = ({ id, username, email, password, avatar })=> {
    console.log('%s.handleSubmit()', this.constructor.name, { id, username, email, password, avatar });

    trackEvent('button', 'update-profile');
    this.props.updateUserProfile({
      profile : { id, username : email, email, password, avatar },
      remote  : true
    });
  };

  render() {
    console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { profile, password, team } = this.props;
    const { outro, submitting } = this.state;
    return (<BaseOverlay tracking={Modals.PROFILE} outro={outro} title="Edit Profile" closeable={false} onComplete={this.handleComplete}>
      <div className="profile-modal">
        <div className="form-wrapper">
          <ProfileForm profile={profile} password={password} team={team} onCancel={this.handleCancel} onSubmit={this.handleSubmit} />
          <div className="footer-wrapper form-disclaimer">
            {(profile.validated)
              ? (<div>Your account is email verified</div>)
              : (<NavLink to="#" onClick={this.handleResendVerify}>Resend Verify Email</NavLink>)
            }
            <NavLink to="#" onClick={this.handleResetPassword}>Delete Account?</NavLink>
          </div>
        </div>
        {submitting && (<div className="base-overlay-loader-wrapper">
          {/*{(true) && (<div className="base-overlay-loader-wrapper">*/}
          <div className="base-overlay-loader" />
        </div>)}
      </div>
    </BaseOverlay>);
  }
}


const mapStateToProps = (state, ownProps)=> {
  return {
    profile  : state.user.profile,
    password : state.user.password,
    team     : state.team
  };
};

const mapDispatchToProps = (dispatch)=> {
  return {
    fetchUserTeams    : (payload)=> dispatch(fetchUserTeams(payload)),
    fetchUserProfile  : ()=> dispatch(fetchUserProfile()),
    updateUserProfile : (payload)=> dispatch(updateUserProfile(payload))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileModal);
