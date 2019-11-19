
import React, { Component } from 'react';
import './RegisterForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';

import { API_ENDPT_URL } from '../../../consts/uris';


class RegisterForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inviteID      : props.inviteID,
			username      : '',
			email         : (props.email) ? props.email : '',
			password      : '',
			password2     : '',
			usernameValid : true,
			emailValid    : true,
			passwordValid : true
		};

		this.passwordTextfield = React.createRef();
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		if (prevProps.email !== this.props.email) {
			const { email } = this.props;
			this.setState({ email });
		}
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.passwordTextfield = null;
	}

	handlePassword = ()=> {
// 		console.log('%s.handlePassword()', this.constructor.name);

		this.setState({
			password      : '',
			password2     : '',
			passwordValid : true,
			passMsg       : ''
		});

		setTimeout(() => {
			this.passwordTextfield.current.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
// 		console.log('%s.handleSubmit()', this.constructor.name, event.target);
		event.preventDefault();

		const { inviteID, username, email, password, password2 } = this.state;
		const usernameValid = (username.length > 0 && !username.includes('@'));
		const emailValid = Strings.isEmail(email);
		const passwordValid = (password.length > 0 && password === password2);

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
			username      : (usernameValid) ? username : 'Username Invalid',
			email         : (emailValid) ? email : 'Email Address Invalid',
			passMsg       : (passwordValid) ? '' : 'Password Invalid',
			usernameValid : usernameValid,
			emailValid    : emailValid,
			passwordValid : passwordValid
		});


		if (usernameValid && emailValid && passwordValid) {
			axios.post(API_ENDPT_URL, {
				action  : 'REGISTER',
				payload : { username, email, password, inviteID }
			}).then((response) => {
				console.log('REGISTER', response.data);
				const status = parseInt(response.data.status, 16);
// 				console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

				if (status === 0x11) {
					this.props.onRegistered(response.data.user);

				} else {
					this.setState({
						username      : Bits.contains(status, 0x01) ? username : 'Username Already in Use',
						email         : Bits.contains(status, 0x10) ? email : 'Email Address Already in Use',
						password      : '',
						password2     : '',
						usernameValid : Bits.contains(status, 0x01),
						emailValid    : Bits.contains(status, 0x10)
					});
				}
			}).catch((error)=> {
			});
		}
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { username, email, password, password2 } = this.state;
		const { usernameValid, emailValid, passwordValid } = this.state;

		return (
			<div className="register-form">
				<form onSubmit={this.handleSubmit}>
					<input type="text" placeholder="Enter Username" value={username} onFocus={()=> this.setState({ username : '', usernameValid : true })} onChange={(event)=> this.setState({ username : event.target.value })} autoComplete="new-password" name="username" />
					<input type="text" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : '', emailValid : true })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" name="email" />
					<input type="password" placeholder="Enter Password" value={password} style={{ display : (passwordValid) ? 'block' : 'none' }} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} onClick={this.handlePassword} autoComplete="new-password" name="password" ref={(element)=> this.passwordTextfield = element} />
					<input type="password" placeholder="Confirm Password" value={password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} autoComplete="new-password" name="password2" />
					<button disabled={(username.length === 0 || email.length === 0 || password.length === 0 || password2.length === 0 || !usernameValid || !emailValid || !passwordValid)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Sign Up</button>
				</form>
			</div>
		);
	}
}

export default RegisterForm;
