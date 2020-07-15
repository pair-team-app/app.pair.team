
import React, { Component } from 'react';
import './InviteModal.css';

import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import InviteForm from '../../forms/InviteForm';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import { Modals } from '../../../consts/uris';
import { updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';
import pairLogo from '../../../assets/images/logos/logo-pairurl-310.png';


class InviteModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro    : false,
			email    : null,
			upload   : null,
			outroURI : null
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		if (!prevProps.profile && profile) {
		}
	}

	handleComplete = ()=> {
// console.log('%s.handleComplete()', this.constructor.name);

		const { outroURI } = this.state;
		this.setState({ outro : false }, ()=> {
			this.props.onComplete();

			if (outroURI) {
				if (outroURI.startsWith('/modal')) {
					this.props.onModal(`/${URIs.lastComponent(outroURI)}`);
				}
			}
		});
	};

	handleError = (error)=> {
// console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			type    : POPUP_TYPE_ERROR,
			content : error.code
		});
	};

	handleLoggedIn = (profile)=> {
// console.log('%s.handleLoggedIn()', this.constructor.name, profile, this.props);

		trackEvent('user', 'login');
    this.setState({ outro : true }, ()=> {
      setTimeout(()=> {
        this.props.onLoggedIn(profile);
      }, 333);
    });
	};

	handleModal = (uri)=> {
// console.log('%s.handleModal()', this.constructor.name, uri);
		this.setState({
			outro    : true,
			outroURI : `/modal${uri}`
		});
	};


	render() {
// console.log('%s.render()', this.constructor.name, this.props, this.state);

    const { profile, team } = this.props;
		const { outro } = this.state;
    
		return (<BaseOverlay
      tracking={Modals.LOGIN}
      outro={outro}
      filled={true}
      closeable={false}
      delay={125}
      onComplete={this.handleComplete}>

      <div className="invite-modal">
        <div className="base-overlay-header-wrapper">
          <img className="base-overlay-header-logo" src={pairLogo} alt="Logo" />
        </div>

        <div className="content-wrapper">
          <InviteForm
            profile={profile}
            team={team}
            onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
            onInvitesSent={this.handleInvitesSent} />
        </div>

        <div className="base-overlay-footer-wrapper form-disclaimer">
          <div onClick={()=> this.handleModal(Modals.INVITE)}>Skip This</div>
        </div>
      </div>
    </BaseOverlay>);
	}
}


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});

};

const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.user.profile,
    team    : state.team
	});
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InviteModal));
