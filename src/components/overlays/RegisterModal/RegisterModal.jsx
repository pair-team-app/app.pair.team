
import React, { Component } from 'react';
import './RegisterModal.css';

import axios from 'axios';
import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import RegisterForm from '../../forms/RegisterForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR } from '../PopupNotification';
import { API_ENDPT_URL, Modals } from '../../../consts/uris';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { buildInspectorPath } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';
import pairLogo from '../../../assets/images/logos/logo-obit-310.png';

class RegisterModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email    : null,
			upload   : null,
			outroURI : null
		};
	}

	componentDidMount() {
		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		if (this.props.invite) {
			axios.post(API_ENDPT_URL, {
				action  : 'INVITE_LOOKUP',
				payload : { invite_id : this.props.invite.id }
			}).then((response) => {
				console.log('INVITE_LOOKUP', response.data);
				const { invite, upload } = response.data;
				if (invite.id === this.props.invite.id) {
					const { email } = invite;
					trackEvent('user', 'invite');
					this.setState({ email, upload });
					this.props.setRedirectURI(buildInspectorPath(upload));
				}

			}).catch((error)=> {
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		if (!prevProps.profile && profile) {
			this.setState({ outro : true });
		}
	}

	handleComplete = ()=> {
// 		console.log('%s.handleComplete()', this.constructor.name);

		const { outroURI } = this.state;
		this.setState({ outro : false }, ()=> {
			this.props.onComplete();

			const { redirectURI } = this.props;
			if (redirectURI) {
				this.props.history.push(redirectURI);

			} else {
				if (outroURI) {
					if (outroURI.startsWith('/modal')) {
						this.props.setRedirectURI(null);
						this.props.onModal(`/${URIs.lastComponent(outroURI)}`);
					}
				}
			}
		});
	};

	handleError = (error)=> {
		console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
		});
	};

	handleLogin = ()=> {
		console.log('%s.handleLogin()', this.constructor.name);

		this.setState({
			outro    : true,
			outroURI : `/modal${Modals.LOGIN}`
		});
	};

	handleRegistered = (profile)=> {
// 		console.log('%s.handleRegistered()', this.constructor.name, profile);

		const { redirectURI } = this.props;
		const { upload } = this.state;
		if (redirectURI && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
		}

		trackEvent('user', 'sign-up');
		this.props.onRegistered(profile);
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

// 		const { team } = this.props;
		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={`register/${URIs.firstComponent()}`}
				outro={outro}
				closeable={false}
				onComplete={this.handleComplete}>

				<div className="register-modal">
					<div className="register-modal-header-wrapper">
						<img className="register-modal-header-logo" src={pairLogo} alt="Logo" />
					</div>

					<div className="register-modal-content-wrapper">
						<RegisterForm
							title={null}
							inviteID={null}
							email={null}
							onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
							onRegistered={this.handleRegistered} />
					</div>

					<div className="register-modal-footer-wrapper">
						{/*<div className="register-modal-footer-link">Not a member of this Pair yet?</div>*/}
						<div className="register-modal-footer-link" onClick={this.handleLogin}>Login</div>
					</div>
				</div>
			</BaseOverlay>);
	}
}


const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURI    : (url)=> dispatch(setRedirectURI(url)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});

};

const mapStateToProps = (state, ownProps)=> {
	return ({
		invite      : state.invite,
		profile     : state.userProfile,
		redirectURI : state.redirectURI,
		team        : state.team
	});
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RegisterModal));
