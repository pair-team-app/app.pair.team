
import React, { Component } from 'react';
import './LoginPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import LoginForm from '../forms/LoginForm';
import { setRedirectURL, updateDeeplink, updateUserProfile } from '../../redux/actions';
import { buildInspectorPath, isUserLoggedIn } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({
		redirectURL : state.redirectURL
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		setRedirectURL    : (url)=> dispatch(setRedirectURL(url)),
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
		console.log('LoginPage.componentDidMount()', this.props, this.state);

		const { inviteID } = this.state;
		if (inviteID) {
			let formData = new FormData();
			formData.append('action', 'INVITE_LOOKUP');
			formData.append('invite_id', inviteID);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('INVITE_LOOKUP', response.data);
					const { invite, upload } = response.data;

					if (invite.id === inviteID) {
						const { email } = invite;
						this.setState({ email, upload });
						this.props.setRedirectURL(buildInspectorPath(upload, '/inspect'));
					}
				}).catch((error) => {
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('LoginPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (isUserLoggedIn()) {
			const { redirectURL } = this.props;
			const { upload } = this.state;

			if (redirectURL && upload) {
				this.props.updateDeeplink({ uploadID : upload.id });
				this.props.onPage(redirectURL.substr(1));
			}
		}
	}

	handleLoggedIn = (profile)=> {
		console.log('LoginPage.handleLoggedIn()', profile, this.props);

		trackEvent('user', 'login');
		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);

		const { redirectURL } = this.props;
		const { upload } = this.state;
		if (redirectURL && upload) {
			this.props.updateDeeplink({ uploadID : upload.id });
		}

		this.props.onPage((redirectURL) ? redirectURL.substr(1) : '');
	};

	render() {
// 		console.log('LoginPage.render()', this.props, this.state);

		const { inviteID, email } = this.state;
		return (
			<div className="page-wrapper login-page-wrapper">
				<h3>Login to Design Engine</h3>
				<h4>Enter Username or Email & Password to Login to Design Engine.</h4>
				<LoginForm inviteID={inviteID} email={email} onLoggedIn={this.handleLoggedIn} onPage={this.props.onPage} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
