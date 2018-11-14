
import React, { Component } from 'react';
import './RegisterPage.css';

import axios from "axios/index";
import cookie from "react-cookies";
import { Column, Row } from 'simple-flexbox';

class RegisterPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email         : '',
			password      : '',
			password2     : '',
			emailValid    : false,
			passwordValid : false,
			errorMsg      : ''
		};
	}

	handleSubmit = (event)=> {
		event.preventDefault();

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		const { email, password, password2 } = this.state;
		const emailValid = re.test(String(email).toLowerCase());
		const passwordValid = (password.length > 0);

		if (password === password2) {
			this.setState({
				emailValid    : emailValid,
				passwordValid : passwordValid
			});

			if (emailValid && passwordValid) {
				let formData = new FormData();
				formData.append('action', 'REGISTER');
				formData.append('email', email);
				formData.append('password', password);
				formData.append('type', 'user');
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('REGISTER', response.data);
						if (response.data.status === true) {
							cookie.save('user_id', response.data.user_id, { path : '/' });
							this.props.onPage('//');

						} else {
							this.setState({ errorMsg : 'Email Address Already Signed Up!'});
						}
					}).catch((error) => {
				});
			}

		} else {
			this.setState({ errorMsg : 'Passwords Do Not Match!'});
		}
	};

	render() {
		const { email, password, password2 } = this.state;
		const { action, emailValid, passwordValid, errorMsg } = this.state;
		const emailClass = (action === '') ? 'input-wrapper' : (action === 'REGISTER' && !emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const passwordClass = (action === '') ? 'input-wrapper' : (action === 'REGISTER' && !passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const password2Class = (action === '') ? 'input-wrapper' : (action === 'REGISTER' && !passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		return (
			<div className="page-wrapper register-page-wrapper">
				<h4>Sign Up</h4>
				{(errorMsg !== '') && (<div className="input-wrapper input-wrapper-error"><input type="text" placeholder="" value={errorMsg} disabled /></div>)}
				<form onSubmit={this.handleSubmit}>
					<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ errorMsg : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className={passwordClass}><input type="password" name="password" placeholder="Enter Password" value={password} onFocus={()=> this.setState({ errorMsg : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className={password2Class}><input type="password" name="password2" placeholder="Confirm Password" value={password2} onFocus={()=> this.setState({ errorMsg : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className="overlay-button-wrapper"><Row vertical="center">
						<Column><button type="submit" className="overlay-button overlay-button-confirm" onClick={(event)=> this.handleSubmit(event)}>Sign Up</button></Column>
						<Column><div className="page-link" onClick={()=> this.props.onPage('login')}>Sign In</div></Column>
					</Row></div>
				</form>
			</div>
		);
	}
}

export default RegisterPage;
