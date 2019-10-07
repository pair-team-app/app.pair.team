
import React, { Component } from 'react';
import './RegisterForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';
import { Row } from 'simple-flexbox';

import { Modals, API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


const passwordTextfield = React.createRef();

const txtfieldClass = (isValid)=> {
	return ((isValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error');
};


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
	}

	componentDidMount() {
// 		console.log('RegisterForm.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('RegisterForm.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (prevProps.email !== this.props.email) {
			const { email } = this.props;
			this.setState({ email });
		}
	}

	componentWillUnmount() {
// 		console.log('RegisterForm.componentWillUnmount()');
	}

	handlePassword = ()=> {
// 		console.log('RegisterForm.handlePassword()');

		this.setState({
			password      : '',
			password2     : '',
			passwordValid : true,
			passMsg       : ''
		});

		setTimeout(() => {
			passwordTextfield.current.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
// 		console.log('RegisterForm.handleSubmit()', event.target);
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
// 		console.log('RegisterForm.render()', this.props, this.state);

		const { title } = this.props;
		const { username, email, password, password2 } = this.state;
		const { usernameValid, emailValid, passwordValid, passMsg } = this.state;

		const usernameClass = txtfieldClass(usernameValid);
		const emailClass = txtfieldClass(emailValid);
		const passwordClass = txtfieldClass(passwordValid);
		const password2Class = txtfieldClass(passwordValid);

		return (
			<div className="register-form-wrapper">
				{(title && title.length > 0) && (<h4>{title}</h4>)}
				<form onSubmit={this.handleSubmit}>
					<div className={usernameClass}><input type="text" name="username" autoComplete="new-password" placeholder="Enter Username" value={username} onFocus={()=> this.setState({ username : '', usernameValid : true })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className={emailClass}><input type="text" name="email" autoComplete="new-password" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : '', emailValid : true })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className={passwordClass} onClick={()=> this.handlePassword()}>
						<input type="password" name="password" autoComplete="new-password" placeholder="Enter Password" value={password} style={{ display : (passwordValid) ? 'block' : 'none' }} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} ref={passwordTextfield} />
						<div className="field-error" style={{ display : (!passwordValid) ? 'block' : 'none' }}>{passMsg}</div>
					</div>
					<div className={password2Class}><input type="password" name="password2" autoComplete="new-password" placeholder="Confirm Password" value={password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<Row vertical="center">
						<button disabled={(username.length === 0 || email.length === 0 || password.length === 0 || password2.length === 0 || !usernameValid || !emailValid || !passwordValid)} type="submit" className="register-form-submit-button adjacent-button" onClick={(event)=> this.handleSubmit(event)}>Sign Up</button>
						{/*<button className="long-button aux-button adjacent-button" onClick={(event)=> { event.preventDefault(); trackEvent('button', 'github'); this.props.onPage(`/modal${Modals.GITHUB_CONNECT}`); }}>Sign Up via GitHub</button>*/}
						<div className="page-link page-link-form" onClick={()=> { trackEvent('link', 'login'); this.props.onPage(`/modal${Modals.LOGIN}`); }}>Need to Login?</div>
					</Row>
				</form>
			</div>
		);
	}
}

export default RegisterForm;
