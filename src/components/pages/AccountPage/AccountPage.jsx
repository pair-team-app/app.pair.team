
import React, { Component } from 'react';
import './AccountPage.css';

import axios from 'axios/index';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import BaseDesktopPage from '../BaseDesktopPage';
import { POPUP_TYPE_OK } from '../../overlays/PopupNotification';
import { API_ENDPT_URL } from '../../../consts/uris';
import { Strings } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};


class AccountPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email         : '',
			emailValid    : true,
			password      : '',
			passMsg       : '',
			passwordValid : true
		};
	}


	handleTextfieldChange = (event)=> {
// 		console.log('RecoverPage.handleTextfieldChange()', event.target.name);

		if (event.target.name === 'email') {
			const email = event.target.value;
			const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email > 0);

			this.setState({ email, emailValid });

		} else {
			const password = event.target.value;
			const passwordValid = (password > 0);

			this.setState({ password, passwordValid });
		}
	};

	handleEmailSubmit = (event)=> {
// 		console.log('RecoverPage.handleEmailSubmit()', event);
		event.preventDefault();

		const { email } = this.state;
		const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0);

		this.setState({
			email      : (emailValid) ? email : 'Invalid Email or Username',
			emailValid : emailValid
		});

		if (emailValid) {
			trackEvent('button', 'submit-email');

			let formData = new FormData();
			formData.append('action', 'RESET_PASSWORD');
			formData.append('email', email);
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
					console.log('RESET_PASSWORD', response.data);
				}).catch((error)=> {
			});

			this.props.onPopup({
				type     : POPUP_TYPE_OK,
				content  : 'Check email for reset link.',
				duration : 2000
			});

			this.props.onPage('');
		}
	};

	handlePasswordSubmit = (event)=> {
// 		console.log('RecoverPage.handlePasswordSubmit()', event);
		event.preventDefault();

		const { password } = this.state;
		const passwordValid = (password.length > 0);

		this.setState({
			password      : (passwordValid) ? password : 'Invalid Password',
			passwordValid : passwordValid
		});

		if (passwordValid) {
			trackEvent('button', 'submit-password');

			let formData = new FormData();
			formData.append('action', 'CHANGE_PASSWORD');
			formData.append('user_id', window.atob(this.props.match.params.userID));
			formData.append('password', password);
			axios.post(API_ENDPT_URL, formData)
				.then((response)=> {
					console.log('CHANGE_PASSWORD', response.data);
					this.props.onPopup({
						type    : POPUP_TYPE_OK,
						content : 'Password changed.'
					});

					this.props.onLogout();
					this.props.onPage('login');
				}).catch((error)=> {
			});
		}
	};

	render() {
// 		console.log('RecoverPage.render()', this.props, this.state);

		const { email, password, passMsg, emailValid, passwordValid } = this.state;
		const emailClass = (emailValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
		const passwordClass = (passwordValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';

		return (
			<BaseDesktopPage className="account-page-wrapper">
				{(typeof this.props.match.params.userID === 'undefined')
					? (<div className="account-page-form-wrapper">
						<h4>Forgot Password</h4>
						<form onSubmit={this.handleEmailSubmit}>
							<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : '', emailValid : true })} onChange={(event)=> this.handleTextfieldChange(event)} /></div>
							<Row vertical="center">
								<button disabled={!emailValid || email.length === 0} type="submit" className="long-button adjacent-button" onClick={(event)=> this.handleEmailSubmit(event)}>Submit</button>
								<div className="page-link page-link-form" onClick={()=> this.props.onPage('login')}>Want to Login?</div>
							</Row>
						</form>
					</div>)

					: (<div className="account-page-form-wrapper">
						<h4>Reset Password</h4>
						<form onSubmit={this.handlePasswordSubmit}>
							<div className={passwordClass}>
								<input type="password" name="password" placeholder="Enter New Password" value={password} onFocus={()=> this.setState({ password : '', passwordValid : true })} onChange={(event)=> this.handleTextfieldChange(event)} />
								<div className="field-error" style={{ display : (!passwordValid) ? 'block' : 'none' }}>{passMsg}</div>
							</div>
							<Row vertical="center">
								<button disabled={!passwordValid || password.length === 0} type="submit" className="long-button adjacent-button" onClick={(event)=> this.handlePasswordSubmit(event)}>Submit</button>
								<div className="page-link page-link-form" onClick={()=> this.props.onPage('login')}>Want to Login?</div>
							</Row>
						</form>
					</div>)}
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps)(AccountPage);
