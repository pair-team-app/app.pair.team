
import React, { Component } from 'react';
import './RegisterModal.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import BaseOverlay from '../BaseOverlay';
import RegisterForm from '../../forms/RegisterForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR } from '../PopupNotification';
import { API_ENDPT_URL, GITHUB_APP_AUTH } from '../../../consts/uris';
import { setRedirectURI, updateUserProfile } from '../../../redux/actions';
import { buildInspectorPath } from '../../../utils/funcs';
import { DateTimes, URLs } from './../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';
import qs from "qs";

class RegisterModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email  : null,
			upload : null,
			authID : 0
		};

		this.githubWindow = null;
		this.authInterval = null;
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

		if (this.props.openAuth) {
			const code = DateTimes.epoch(true);
			axios.post(API_ENDPT_URL, qs.stringify({ code,
				action : 'GITHUB_AUTH'
			})).then((response) => {
				console.log('GITHUB_AUTH', response.data);
				const authID = response.data.auth_id << 0;
				this.setState({ authID }, ()=> {
					if (!this.githubWindow || this.githubWindow.closed || this.githubWindow.closed === undefined) {
						clearInterval(this.authInterval);
						this.authInterval = null;
						this.githubWindow = null;
					}

					this.githubWindow = window.open(GITHUB_APP_AUTH.replace('__{EPOCH}__', code), '', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=600, height=600, top=${((window.innerHeight - 600) * 0.5) << 0}, left=${((window.innerWidth - 600) * 0.5) << 0}`);
					this.authInterval = setInterval(()=> {
						this.onAuthInterval();
					}, 1000);
				});
			}).catch((error)=> {
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('RegisterModal.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (!prevProps.profile && this.props.profile) {
			this.props.onRegistered();
			this.setState({ outro : true });
		}
	}

	componentWillUnmount() {
		console.log('RegisterModal.componentWillUnmount()');

		if (this.authInterval) {
			clearInterval(this.authInterval);
		}

		if (this.githubWindow) {
			this.githubWindow.close();
		}

		this.authInterval = null;
		this.githubWindow = null;
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
	};

	handlePage = (url)=> {
		console.log('RegisterModal.handlePage()', url);

		if (url.includes('/github-connect')) {
			const code = DateTimes.epoch(true);

			axios.post(API_ENDPT_URL, qs.stringify({ code,
				action : 'GITHUB_AUTH'
			})).then((response) => {
				console.log('GITHUB_AUTH', response.data);
				const authID = response.data.auth_id << 0;
				this.setState({ authID }, ()=> {
					if (!this.githubWindow || this.githubWindow.closed || this.githubWindow.closed === undefined) {
						clearInterval(this.authInterval);
						this.authInterval = null;
						this.githubWindow = null;
					}

					this.githubWindow = window.open(GITHUB_APP_AUTH.replace('__{EPOCH}__', code), '', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=600, height=600, top=${((window.innerHeight - 600) * 0.5) << 0}, left=${((window.innerWidth - 600) * 0.5) << 0}`);
					this.authInterval = setInterval(()=> {
						this.onAuthInterval();
					}, 1000);
				});
			}).catch((error)=> {
			});

		} else {
			this.setState({ outro : true }, ()=> {
				this.props.setRedirectURI(url);
			});
		}
	};

	onAuthInterval = ()=> {
		console.log('RegisterModal.onAuthInterval()');

		if (!this.githubWindow || this.githubWindow.closed || this.githubWindow.closed === undefined) {
			clearInterval(this.authInterval);
			this.authInterval = null;
			this.githubWindow = null;

		} else {
			const { authID } = this.state;
			axios.post(API_ENDPT_URL, qs.stringify({
				action  : 'GITHUB_AUTH_CHECK',
				auth_id : authID
			})).then((response) => {
				console.log('GITHUB_AUTH_CHECK', response.data);
				const { user } = response.data;
				if (user) {
					trackEvent('github', 'success');
					clearInterval(this.authInterval);
					this.authInterval = null;
					this.githubWindow.close();
					this.githubWindow = null;

					this.handleRegistered(user);
				}
			}).catch((error)=> {
			});
		}
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
		profile     : state.userProfile,
		redirectURI : state.redirectURI
	});
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterModal);
