
import React, { Component } from 'react';
import './RegisterPage.css';

import axios from 'axios/index';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import { hasBit, isValidEmail } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';

const passwordTextfield = React.createRef();

class RegisterPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			username      : '',
			email         : '',
			password      : '',
			password2     : '',
			usernameValid : true,
			emailValid    : true,
			passwordValid : true,
			passMsg       : ''
		};
	}

	componentDidMount() {
	}

	handlePassword = ()=> {
		this.setState({
			password      : '',
			password2     : '',
			passwordValid : true,
			passMsg       : ''
		});

		setTimeout(function() {
			passwordTextfield.current.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
		event.preventDefault();

		const { username, email, password, password2 } = this.state;
		const usernameValid = (username.length > 0 && !username.includes('@'));
		const emailValid = isValidEmail(email);
		const passwordValid = (password.length > 0);

		if (password !== password2) {
			this.setState({
				password      : '',
				password2     : '',
				passwordValid : false,
				passMsg       : 'Passwords don\'t match'
			});

			return;
		}

		this.setState({
			username      : (usernameValid) ? username : 'Invalid Username',
			email         : (emailValid) ? email : 'Invalid Email',
			passMsg       : (passwordValid) ? '' : 'Invalid Password',
			usernameValid : usernameValid,
			emailValid    : emailValid,
			passwordValid : passwordValid
		});


		if (usernameValid && emailValid && passwordValid) {
			let formData = new FormData();
			formData.append('action', 'REGISTER');
			formData.append('username', username);
			formData.append('email', email);
			formData.append('password', password);
			formData.append('type', 'user');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('REGISTER', response.data);
					const status = parseInt(response.data.status, 16);

					console.log('status', status, hasBit(status, 0x01), hasBit(status, 0x10));

					if (status === 0x11) {
						trackEvent('sign-up');
						cookie.save('user_id', response.data.user_id, { path : '/' });
						this.props.onPage('');

					} else {
						this.setState({
							username      : hasBit(status, 0x01) ? username : 'Username Already in Use',
							email         : hasBit(status, 0x10) ? email : 'Email Already in Use',
							password      : '',
							password2     : '',
							usernameValid : hasBit(status, 0x01),
							emailValid    : hasBit(status, 0x10)
						});
					}
				}).catch((error) => {
			});
		}
	};

	render() {
		console.log('RegisterPage.render()');

		const { username, email, password, password2 } = this.state;
		const { usernameValid, emailValid, passwordValid, passMsg } = this.state;

		const usernameClass = (usernameValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
		const emailClass = (emailValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
		const passwordClass = (passwordValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
		const password2Class = (passwordValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
		const buttonClass = (usernameValid && emailValid && passwordValid) ? 'fat-button adjacent-button' : 'fat-button adjacent-button button-disabled';

		return (
			<div className="page-wrapper register-page-wrapper">
				<h3>Sign Up</h3>
				Enter the email address of each member of your team to invite them to this project.
				<div className="register-page-form-wrapper">
					<form onSubmit={this.handleSubmit}>
						<div className={usernameClass}><input type="text" name="username" placeholder="Enter Username" value={username} onFocus={()=> this.setState({ username : '', usernameValid : true })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : '', emailValid : true })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={passwordClass} onClick={()=> this.handlePassword()}>
							<input type="password" name="password" placeholder="Enter Password" value={password} style={{ display : (passwordValid) ? 'block' : 'none' }} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} ref={passwordTextfield} />
							<div className="field-error" style={{ display : (!passwordValid) ? 'block' : 'none' }}>{passMsg}</div>
						</div>
						<div className={password2Class}><input type="password" name="password2" placeholder="Confirm Password" value={password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<Row vertical="center">
							<Column><button type="submit" className={buttonClass} onClick={(event)=> this.handleSubmit(event)}>Submit</button></Column>
							<Column><div className="page-link" style={{fontSize:'14px'}} onClick={()=> this.props.onPage('login')}>Already have an account?</div></Column>
						</Row>
					</form>
				</div>
			</div>
		);
	}
}

export default RegisterPage;
