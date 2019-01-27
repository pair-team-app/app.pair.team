
import React, { Component } from 'react';
import './RegisterPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import RegisterForm from '../forms/RegisterForm';
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


class RegisterPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			inviteID : props.match.params.inviteID,
			email    : null,
			upload   : null
		};
	}

	componentDidMount() {
		console.log('RegisterPage.componentDidMount()', this.props, this.state);

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
		console.log('RegisterPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (isUserLoggedIn()) {
			const { redirectURL } = this.props;
			const { upload } = this.state;

			if (redirectURL && upload) {
				this.props.updateDeeplink({ uploadID : upload.id });
				this.props.onPage(redirectURL.substr(1));
			}
		}
	}

	handleRegistered = (profile)=> {
		console.log('RegisterPage.handleRegistered()', profile);

		trackEvent('user', 'sign-up');
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
		console.log('RegisterPage.render()', this.props, this.state);

		const { email, inviteID } = this.state;
		return (
			<div className="page-wrapper register-page-wrapper">
				<h3>Sign Up for Design Engine</h3>
				Enter Username, Email, & Password to Sign Up for Design Engine.
				<RegisterForm inviteID={inviteID} email={email} onRegistered={this.handleRegistered} onLogin={()=> this.props.onPage((inviteID) ? `login/${inviteID}` : 'login')} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
