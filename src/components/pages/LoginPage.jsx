
import React, { Component } from 'react';
import './LoginPage.css';

import { Column, Row } from 'simple-flexbox';
import cookie from "react-cookies";
import axios from "axios/index";

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

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		const email = this.state.email;
		const password = this.state.password;

		const isEmailValid = re.test(String(email).toLowerCase());
		const isPasswordValid = (password.length > 0);

		this.setState({
			action        : 'LOGIN',
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
						this.props.onPage('//');

					} else {
					}
				}).catch((error) => {
			});
		}
	};


	render() {
		const { action, emailValid, passwordValid } = this.state;
		const { email, password } = this.state;

		const emailClass = (action === '') ? 'input-wrapper' : (action === 'LOGIN' && !emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const passwordClass = (action === '') ? 'input-wrapper' : (action === 'LOGIN' && !passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		return (
			<div className="page-wrapper register-page-wrapper">
				<h4>Sign In</h4>
				{(action === 'LOGIN' && emailValid && passwordValid) && (<div className="input-wrapper input-wrapper-error"><input type="text" placeholder="" value="Email Or Password Are Incorrect!" disabled /></div>)}
				<form onSubmit={this.handleSubmit}>
					<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ action : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className={passwordClass}><input type="password" name="password" placeholder="Enter Password" value={password} onFocus={()=> this.setState({ action : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className="overlay-button-wrapper">
						<button type="submit" className="overlay-button overlay-button-confirm" onClick={(event)=> this.handleSubmit(event)}>Sign In</button>
					</div>
				</form>
			</div>
		);
	}
}

export default LoginPage;
