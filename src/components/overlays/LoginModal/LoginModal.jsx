
import React, { Component } from 'react';
import './LoginModal.css';

import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import LoginForm from '../../forms/LoginForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR } from '../PopupNotification';
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
// 		console.log('LoginModal.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		if (!prevProps.profile && profile) {
			this.setState({ outro : true });
		}
	}

	handleComplete = ()=> {
// 		console.log('LoginModal.handleComplete()');

		const { outroURI } = this.state;
		this.setState({ outro : false }, ()=> {
			const { redirectURI } = this.props;
			if (redirectURI) {
				this.props.onPage(redirectURI);

			} else {
				if (outroURI) {
					if (outroURI.startsWith('/modal')) {
						this.props.setRedirectURI(null);
						this.props.onModal(`/${URIs.lastComponent(outroURI)}`);
					}
				}
			}

			this.props.onComplete();
		});
	};

	handleError = (error)=> {
// 		console.log('LoginModal.handleError()', error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
		});
	};

	handleLoggedIn = (profile)=> {
		console.log('LoginModal.handleLoggedIn()', profile, this.props);

		trackEvent('user', 'login');
		const { redirectURI } = this.props;
		const { upload } = this.state;
		if (redirectURI && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
		} else {
		}
		this.props.onLoggedIn(profile);
	};

	handlePage = (url)=> {
// 		console.log('LoginModal.handlePage()', url);

		if (url.startsWith('/modal')) {
			this.props.onModal(`/${URIs.lastComponent(url)}`);

		} else {
			this.setState({
				outro    : true,
				outroURI : url
			});
		}
	};


	render() {
// 		console.log('LoginModal.render()', this.props, this.state);

		const { team } = this.props;
		const { outro } = this.state;

		return (
			<BaseOverlay
				tracking={`login/${URIs.firstComponent()}`}
				outro={outro}
				unblurred={true}
				closeable={(!team)}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="login-modal-wrapper">
					<div className="login-modal-header">
						<h4 className="full-width">Login</h4>
					</div>

					<div className="login-modal-content-wrapper">
						<LoginForm
							title={null}
							inviteID={null}
							email={null}
							onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
							onLoggedIn={this.handleLoggedIn}
							onPage={this.handlePage} />
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
		team        : state.team,
		invite      : state.invite,
		profile     : state.userProfile,
		redirectURI : state.redirectURI
	});
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
