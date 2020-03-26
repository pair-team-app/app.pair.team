import axios from 'axios';
import { URIs } from 'lang-js-utils';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import pairLogo from '../../../assets/images/logos/logo-pairurl-310.png';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import {
  fetchTeamLookup,
  fetchUserProfile,
  updateUserProfile
} from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import ProfileForm from '../../forms/ProfileForm/ProfileForm';
import BaseOverlay from '../BaseOverlay';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import './ProfileModal.css';

class ProfileModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outro: false,
      outroURI: null,
      updated: false,
      submitting: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(
      '%s.componentDidUpdate()',
      this.constructor.name,
      prevProps,
      this.props.profile,
      prevState,
      this.state,
      snapshot
    );

    const { profile } = this.props;
    if (profile !== prevProps.profile && profile.status === 0x00) {
      this.setState({
        outro: true,
        updated: true
      });
    }
  }

  handleCancel = ()=> {
    console.log('%s.handleCancel()', this.constructor.name);
    trackEvent('button', 'profile-cancel');

    this.setState({
      outro: true,
      updated: false
    });
  };

  handleComplete = ()=> {
    console.log('%s.handleComplete()', this.constructor.name, this.state);

    const { updated } = this.state;
    if (updated) {
      this.props.onPopup({
        type: POPUP_TYPE_OK,
        content: 'Profile updated.',
        delay: 333
      });
    } else {
      this.props.fetchUserProfile();
      this.props.onPopup({
        content: 'No profile changes made.',
        delay: 333
      });
    }

    this.setState({ outro: false }, ()=> {
      const { outroURI } = this.state;

      if (outroURI && outroURI.startsWith('/modal')) {
        this.props.onModal(`/${URIs.lastComponent(outroURI)}`);
      }

      this.props.onComplete();
    });
  };

  handleDowngradePlan = (event)=> {
    console.log('%s.handleDowngradePlan()', this.constructor.name, event);

    this.setState({ submitting: true }, ()=> {
      const { profile, team } = this.props;
      axios
        .post(API_ENDPT_URL, {
          action: 'CANCEL_SUBSCRIPTION',
          payload: {
            user_id: profile.id,
            email: profile.email,
            team_id: team.id
          }
        })
        .then((response)=> {
          console.log('CANCEL_SUBSCRIPTION', response.data);
          const { error } = response.data;

          this.setState({ submitting: false }, ()=> {
            if (error) {
              this.props.onPopup({
                type: POPUP_TYPE_ERROR,
                content: error.message,
                delay: 333
              });
            } else {
              this.props.onPopup({
                type: POPUP_TYPE_OK,
                content: 'Successfully canceled your team plan.',
                duration: 3333
              });

              this.setState({ updated: true }, ()=> {
                this.props.fetchTeamLookup({ userProfile : profile });
              });
            }
          });
        })
        .catch((error)=> {});
    });
  };

  handleResetPassword = ()=> {
    console.log('%s.handleResetPassword()', this.constructor.name);
    this.setState({
      outro    : true,
      outroURI : `/modal${Modals.RECOVER}`
    });
  };

  handleSubmit = ({ id, username, email, password })=> {
    console.log('%s.handleSubmit()', this.constructor.name, { id, username, email, password });

    trackEvent('button', 'update-profile');
    this.props.updateUserProfile({ id, username, email, password });
  };

  render() {
    console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { profile, team } = this.props;
    const { outro, submitting } = this.state;
    return (
      <BaseOverlay
        tracking={Modals.PROFILE}
        outro={outro}
        filled={true}
        closeable={true}
        title={null}
        onComplete={this.handleComplete}
      >
        <div className="profile-modal">
          <div className="base-overlay-header-wrapper">
            <img
              className="base-overlay-header-logo"
              src={pairLogo}
              alt="Logo"
            />
          </div>
          <div className="profile-modal-content-wrapper">
            <ProfileForm
              profile={profile}
              team={team}
              onCancel={this.handleCancel}
              onDowngradePlan={this.handleDowngradePlan}
              onSubmit={this.handleSubmit}
            />
            <div className="form-disclaimer">
              <div onClick={this.handleResetPassword}>Delete Account?</div>
            </div>
          </div>
          {submitting && (
            <div className="base-overlay-loader-wrapper">
              {/*{(true) && (<div className="base-overlay-loader-wrapper">*/}
              <div className="base-overlay-loader" />
            </div>
          )}
        </div>
      </BaseOverlay>
    );
  }
}

const mapStateToProps = (state, ownProps)=> {
  return {
    profile : state.userProfile,
    team    : state.team
  };
};

const mapDispatchToProps = (dispatch)=> {
  return {
    fetchTeamLookup   : (payload)=> dispatch(fetchTeamLookup(payload)),
    fetchUserProfile  : ()=> dispatch(fetchUserProfile()),
    updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProfileModal)
);
