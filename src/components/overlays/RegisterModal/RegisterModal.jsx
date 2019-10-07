
import React, { Component } from 'react';
import './RegisterModal.css';

import axios from 'axios';
import { URIs } from 'lang-js-utils';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import RegisterForm from '../../forms/RegisterForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR } from '../PopupNotification';
import { API_ENDPT_URL } from '../../../consts/uris';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { buildInspectorPath } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';
import deLogo from '../../../assets/images/logos/logo-designengine.svg';

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
// 		console.log('RegisterModal.componentDidMount()', this.props, this.state);

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
// 		console.log('RegisterModal.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		const { profile } = this.props;
		if (!prevProps.profile && profile) {
			this.setState({ outro : true });
		}
	}

	handleComplete = ()=> {
		console.log('RegisterModal.handleComplete()');

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
		console.log('RegisterModal.handleError()', error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
		});
	};

	handlePage = (url)=> {
// 		console.log('RegisterModal.handlePage()', url);

		if (url.startsWith('/modal')) {
			this.props.onModal(`/${URIs.lastComponent(url)}`);

		} else {
			this.setState({
				outro    : true,
				outroURI : url
			});
		}
	};

	handleRegistered = (profile)=> {
		console.log('RegisterModal.handleRegistered()', profile);

		const { redirectURI } = this.props;
		const { upload } = this.state;
		if (redirectURI && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
		}

		trackEvent('user', 'sign-up');
		this.props.onRegistered(profile);
	};

	render() {
// 		console.log('RegisterModal.render()', this.props, this.state);

		const { team } = this.props;
		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={`register/${URIs.firstComponent()}`}
				outro={outro}
				unblurred={true}
				closeable={(!team)}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="register-modal-wrapper">
					<div className="register-modal-header">
						<img className="register-modal-header-logo" src={deLogo} alt="Logo" />
					</div>

					<div className="register-modal-content-wrapper">
						<RegisterForm
							title={null}
							inviteID={null}
							email={null}
							onCancel={(event)=> { event.preventDefault(); this.handleComplete(); }}
							onRegistered={this.handleRegistered}
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
		invite      : state.invite,
		profile     : state.userProfile,
		redirectURI : state.redirectURI,
		team        : state.team
	});
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterModal);
