
import React, { Component } from 'react';
import './LoginModal.css';

import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import LoginForm from '../../forms/LoginForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR } from '../PopupNotification';
import { Modals } from '../../../consts/uris';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { trackEvent } from '../../../utils/tracking';


class LoginModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email    : null,
			upload   : null,
			outroURI : null
		};
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
// 		console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
		});
	};

	handleLoggedIn = (profile)=> {
// 		console.log('%s.handleLoggedIn()', this.constructor.name, profile, this.props);

		trackEvent('user', 'login');
		const { redirectURI } = this.props;
		const { upload } = this.state;
		if (redirectURI && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
		}

		this.props.onLoggedIn(profile);
	};

	handleRegister = ()=> {
// 		console.log('%s.handleRegister()', this.constructor.name);
		this.setState({
			outro    : true,
			outroURI : `/modal${Modals.REGISTER}`
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

// 		const { teams } = this.props;
		const { outro } = this.state;

		return (
			<BaseOverlay
				tracking={`login/${URIs.firstComponent()}`}
				outro={outro}
				closeable={false}
				onComplete={this.handleComplete}>

				<div className="login-modal">
					<div className="login-modal-header-wrapper">
						<h4>You must be signed in to view this Pair.</h4>
					</div>

					<div className="login-modal-content-wrapper">
						<LoginForm
							inviteID={null}
							email={null}
							onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
							onLoggedIn={this.handleLoggedIn} />
					</div>

					<div className="login-modal-footer-wrapper">
						<div className="login-modal-footer-link">Not a member of this Pair yet?</div>
						<div className="login-modal-footer-link" onClick={this.handleRegister}>Sign Up</div>
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
		teams       : state.teams,
		invite      : state.invite,
		profile     : state.userProfile,
		redirectURI : state.redirectURI
	});
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginModal));
