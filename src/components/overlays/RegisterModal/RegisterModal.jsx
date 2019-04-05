
import React, { Component } from 'react';
import './RegisterModal.css';

import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import RegisterForm from '../../forms/RegisterForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR } from '../PopupNotification';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { URLs } from './../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';
import cookie from "react-cookies";
import axios from "axios";
import {API_ENDPT_URL} from "../../../consts/uris";
import {buildInspectorPath} from "../../../utils/funcs";


class RegisterModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email  : null,
			upload : null
		};
	}

	componentDidMount() {
		console.log('RegisterModal.componentDidMount()', this.props, this.state);

		if (this.props.invite) {
			let formData = new FormData();
			formData.append('action', 'INVITE_LOOKUP');
			formData.append('invite_id', this.props.invite.id);
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
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

	handleComplete = ()=> {
		console.log('RegisterModal.handleComplete()');

		this.setState({ outro : false }, ()=> {
			const { redirectURI } = this.props;
			if (redirectURI) {

				if (redirectURI.startsWith('/modal')) {
					this.props.setRedirectURI(null);
					this.props.onModal(`/${URLs.lastComponent(redirectURI)}`);

				} else {
					this.props.onPage(redirectURI);
				}
			}

			setTimeout(()=> {
				this.props.onComplete();
			}, 333);
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

	handleLogin = ()=> {
		console.log('RegisterModal.handleLogin()');
		this.setState({ outro : true }, ()=> {
			this.props.setRedirectURI('/modal/login');
		});
	};

	handleRegistered = (profile)=> {
		console.log('RegisterModal.handleRegistered()', profile);

		trackEvent('user', 'sign-up');
		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);

		const { redirectURI } = this.props;
		const { upload } = this.state;
		if (redirectURI && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
		}

		this.props.onRegistered();
		this.setState({ outro : true });
	};

	handlePage = (url)=> {
		console.log('RegisterModal.handlePage()', url);
		this.setState({ outro : true }, ()=> {
			this.props.setRedirectURI(url);
		});
	};


	render() {
		console.log('RegisterModal.render()', this.props, this.state);

		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={`register/${URLs.firstComponent()}`}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="register-modal-wrapper">
					<div className="register-modal-header">
						<h4 className="full-width">Sign Up</h4>
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
		redirectURI : state.redirectURI
	});
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterModal);
