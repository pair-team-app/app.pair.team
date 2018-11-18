
import React, { Component } from 'react';
import './LoginPage.css';

import axios from "axios/index";
import cookie from "react-cookies";
import { Column, Row } from 'simple-flexbox';

class LoginPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email         : '',
			password      : '',
			emailValid    : false,
			passwordValid : false,
			errorMsg      : ''
		};
	}

	handleSubmit = (event)=> {
		console.log('submit()');
		event.preventDefault();

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		const email = this.state.email;
		const password = this.state.password;

		const isEmailValid = re.test(String(email).toLowerCase());
		const isPasswordValid = (password.length > 0);

		this.setState({
			emailValid    : isEmailValid,
			passwordValid : isPasswordValid
		});

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
						cookie.save('user_email', email);
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
		const { action, emailValid, passwordValid, errorMsg } = this.state;
		const { email, password } = this.state;

		const title = (typeof cookie.load('msg') === 'undefined' || cookie.load('msg') === '') ? 'Sign In' : 'You must be signed in to ' + cookie.load('msg');

		const emailClass = (action === '') ? 'input-wrapper' : (action === 'LOGIN' && !emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const passwordClass = (action === '') ? 'input-wrapper' : (action === 'LOGIN' && !passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		cookie.save('msg', '', { path : '/' });
		cookie.remove('msg');
		return (
			<div className="page-wrapper register-page-wrapper">
				<h4>{title}</h4>
				{(errorMsg !== '') && (<div className="input-wrapper input-wrapper-error"><input type="text" placeholder="" value={errorMsg} disabled /></div>)}
				<form onSubmit={this.handleSubmit}>
					<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ errorMsg : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className={passwordClass}><input type="password" name="password" placeholder="Enter Password" value={password} onFocus={()=> this.setState({ errorMsg : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className="overlay-button-wrapper"><Row vertical="center">
						<Column><button type="submit" className="adjacent-button" onClick={(event)=> this.handleSubmit(event)}>Sign In</button></Column>
						<Column><div className="page-link" onClick={()=> this.props.onPage('register')}>Sign Up</div></Column>
					</Row></div>
				</form>
			</div>
		);
	}
}

export default LoginPage;
