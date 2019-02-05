
import React, { Component } from 'react';
import './RegisterPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import RegisterForm from '../forms/RegisterForm';
import { setRedirectURI, updateDeeplink, updateUserProfile } from '../../redux/actions';
import { buildInspectorPath, isUserLoggedIn } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';


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
						trackEvent('user', 'invite');
						this.setState({ email, upload });
						this.props.setRedirectURI(buildInspectorPath(upload));
					}
				}).catch((error)=> {
			});
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('RegisterPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (isUserLoggedIn()) {
			const { redirectURI } = this.props;
			const { upload } = this.state;

			if (redirectURI && upload) {
				this.props.updateDeeplink({ uploadID : upload.id });
				this.props.onPage(redirectURI.substr(1));
			}
		}
	}

	handleRegistered = (profile)=> {
		console.log('RegisterPage.handleRegistered()', profile);

		trackEvent('user', 'sign-up');
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
		console.log('RegisterPage.render()', this.props, this.state);

		const { email, inviteID } = this.state;
		return (
			<div className="page-wrapper register-page-wrapper">
				<RegisterForm
					title="Sign up"
					inviteID={inviteID}
					email={email}
					onRegistered={this.handleRegistered}
					onLogin={()=> this.props.onPage((inviteID) ? `login/${inviteID}` : 'login')} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
