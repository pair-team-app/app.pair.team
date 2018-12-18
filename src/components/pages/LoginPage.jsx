
import React, { Component } from 'react';
import './LoginPage.css';

import axios from "axios/index";
import cookie from "react-cookies";
import { Column, Row } from 'simple-flexbox';

import { isValidEmail } from '../../utils/lang';

class LoginPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action        : '',
			email         : '',
			password      : '',
			emailValid    : false,
			passwordValid : false
		};
	}

	handleSubmit = (event)=> {
		console.log('submit()');
		event.preventDefault();

		const { email, password } = this.state;

		const isEmailValid = isValidEmail(email);
		const isPasswordValid = (password.length > 0);

		this.setState({
			action        : 'LOGIN',
			emailValid    : isEmailValid,
			passwordValid : isPasswordValid
		});

		if (!isEmailValid && email.length > 0) {
			this.setState({ email : 'Invalid Email Address' });
		}

// 		if (!isPasswordValid) {
// 			this.setState({ password : 'Blank Password' });
// 		}

		if (isEmailValid && isPasswordValid) {
			let formData = new FormData();
			formData.append('action', 'LOGIN');
			formData.append('email', email);
			formData.append('password', password);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('LOGIN', response.data);
					if (response.data.status === true) {
						cookie.save('user_id', response.data.user_id, { path : '/' });
						cookie.save('user_email', email, { path : '/' });
						this.props.onPage('');

					} else {
						this.setState({ errorMsg : 'Email and/or Password Are Incorrect!'});
					}
				}).catch((error) => {
			});
		}
	};


	render() {
		console.log('LoginPage.render()');
		const { action, emailValid, passwordValid } = this.state;
		const { email, password } = this.state;

		const title = (typeof cookie.load('msg') === 'undefined') ? 'Login' : 'You must be signed in to ' + cookie.load('msg');

		const emailClass = (action === '') ? 'input-wrapper' : (action === 'LOGIN' && !emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const passwordClass = (action === '') ? 'input-wrapper' : (action === 'LOGIN' && !passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		//const buttonClass = (emailValid && passwordValid) ? 'fat-button adjacent-button' : 'fat-button adjacent-button button-disabled';

		cookie.remove('msg');
		return (
			<div className="page-wrapper register-page-wrapper">
				<h3>{title}</h3>
				<h4>Enter the email address of each member of your team to invite them to this project.</h4>
				<div className="login-page-form-wrapper">
					<form onSubmit={this.handleSubmit}>
						<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ action : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={passwordClass}><input type="password" name="password" placeholder="Enter Password" value={password} onFocus={()=> this.setState({ action : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className="overlay-button-wrapper"><Row vertical="center">
							<Column><button type="submit" className="fat-button adjacent-button" onClick={(event)=> this.handleSubmit(event)}>Submit</button></Column>
							<Column><div className="page-link" style={{fontSize:'14px'}} onClick={()=> this.props.onPage('recover')}>Forgot password?</div></Column>
						</Row></div>
					</form>
				</div>
			</div>
		);
	}
}

export default LoginPage;
