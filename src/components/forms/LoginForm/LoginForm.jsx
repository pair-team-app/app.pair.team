
import React, { Component } from 'react';
import './LoginForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';

import { API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


class LoginForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inviteID      : props.inviteID,
			email         : (props.email) ? props.email : '',
			password      : '',
			emailValid    : true,
			passwordValid : true,
			passMsg       : ''
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

	handlePassword = (event)=> {
// 		console.log('%s.handlePassword()', this.constructor.name);
		event.preventDefault();

		this.setState({
			password      : '',
			passwordValid : true,
			passMsg       : ''
		});

		setTimeout(()=> {
			this.passwordTextfield.current.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
		console.log('%s.handleSubmit()', this.constructor.name, event.target, this.state);
		event.preventDefault();

		trackEvent('button', 'login');

		const { inviteID, email, password } = this.state;
		const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0);
		const passwordValid = (password.length > 0);

		this.setState({
			email         : (emailValid) ? email : 'Email Address or Username Invalid',
			passMsg       : (passwordValid) ? '' : 'Password Invalid',
			emailValid    : emailValid,
			passwordValid : passwordValid
		});

		if (emailValid && passwordValid) {
			axios.post(API_ENDPT_URL, {
				action  : 'LOGIN',
				payload : { email, password, inviteID }
			}).then((response) => {
				console.log('LOGIN', response.data);
				const status = parseInt(response.data.status, 16);

				if (Bits.contains(status, 0x11)) {
					const { user } = response.data;
					this.props.onLoggedIn(user);

				} else {
					this.setState({
						email         : Bits.contains(status, 0x01) ? email : 'Email Address or Username In Use',
						password      : '',
						emailValid    : Bits.contains(status, 0x01),
						passwordValid : Bits.contains(status, 0x10),
						passMsg       : Bits.contains(status, 0x10) ? '' : 'Password Invalid'
					});
				}

			}).catch((error)=> {
			});
		}
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { email, password } = this.state;
		const { emailValid, passwordValid } = this.state;

		return (
			<div className="login-form">
				<form onSubmit={this.handleSubmit}>
					<input type="text" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : '', emailValid : true })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} name="email" autoComplete="off" />
					<input type="password" placeholder="Enter Password" value={password} onChange={(event)=> this.setState({ password : event.target.value })} onClick={this.handlePassword} ref={(element)=> { this.passwordTextfield = element }} name="password" />
					<button disabled={(email.length === 0 || !emailValid || !passwordValid)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Login</button>
				</form>
			</div>
		);
	}
}

export default LoginForm;
