
import React, { Component } from 'react';
import './LoginPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import BaseDesktopPage from './BaseDesktopPage';
import LoginForm from '../../forms/LoginForm';
import { API_URL } from '../../../consts/uris';
import { setRedirectURI, updateDeeplink, updateUserProfile } from '../../../redux/actions';
import { buildInspectorPath, isUserLoggedIn } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({
		redirectURI : state.redirectURI
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURI    : (url)=> dispatch(setRedirectURI(url)),
		updateDeeplink    : (navIDs)=> dispatch(updateDeeplink(navIDs)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


class LoginPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			inviteID : props.match.params.inviteID,
			email    : null,
			upload   : null
		};
	}

	componentDidMount() {
// 		console.log('LoginPage.componentDidMount()', this.props, this.state);

		const { inviteID } = this.state;
		if (inviteID) {
			let formData = new FormData();
			formData.append('action', 'INVITE_LOOKUP');
			formData.append('invite_id', inviteID);
			axios.post(API_URL, formData)
				.then((response)=> {
					console.log('INVITE_LOOKUP', response.data);
					const { invite, upload } = response.data;

					if (invite.id === inviteID) {
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
// 		console.log('LoginPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (isUserLoggedIn()) {
			const { redirectURI } = this.props;
			const { upload } = this.state;

			if (redirectURI && upload) {
				this.props.updateDeeplink({ uploadID : upload.id });
				this.props.onPage(redirectURI.substr(1));
			}
		}
	}

	handleLoggedIn = (profile)=> {
// 		console.log('LoginPage.handleLoggedIn()', profile, this.props);

		trackEvent('user', 'login');
		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);

		const { redirectURI } = this.props;
		const { upload } = this.state;
		if (redirectURI && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
		}

		this.props.onPage((redirectURI) ? redirectURI.substr(1) : '');
	};

	render() {
// 		console.log('LoginPage.render()', this.props, this.state);

		const { inviteID, email } = this.state;
		return (
			<BaseDesktopPage className="login-page-wrapper">
				<LoginForm
					title="Login"
					inviteID={inviteID}
					email={email}
					onLoggedIn={this.handleLoggedIn}
					onPage={this.props.onPage} />
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
