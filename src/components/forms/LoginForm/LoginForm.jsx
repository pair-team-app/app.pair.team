
import React, { Component } from 'react';
import './LoginForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';

import DummyForm from '../../forms/DummyForm';
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
			passMsg       : null,
			validated     : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);

		if (prevProps.email !== this.props.email) {
			const { email } = this.props;
			this.setState({ email });
		}
	}

	handlePassword = (event)=> {
// 		console.log('%s.handlePassword()', this.constructor.name);
		event.preventDefault();

		this.setState({
			validated     : false,
			password      : '',
			passwordValid : true,
			passMsg       : ''
		});
	};

	handleSubmit = (event)=> {
//-/> 		console.log('%s.handleSubmit()', this.constructor.name, event.target, this.state);
		event.preventDefault();

		trackEvent('button', 'login');

		const { inviteID, email, password } = this.state;
		const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0);
		const passwordValid = (password.length > 0);

		this.setState({
			email         : (emailValid) ? email : 'Email Address Invalid',
			passMsg       : (passwordValid) ? '' : 'Password Invalid',
			emailValid    : emailValid,
			passwordValid : passwordValid
		});

		if (emailValid && passwordValid) {
			axios.post(API_ENDPT_URL, {
				action  : 'LOGIN',
				payload : { email, password, inviteID }
			}).then((response) => {
				const { user } = response.data;
				const status = parseInt(response.data.status, 16);
//-/> 				console.log('LOGIN', response.data, parseInt(response.data.status, 16), Bits.contains(status, 0x11), (status & 0x11));

				if (user) {
					this.props.onLoggedIn(user);

				} else {
					this.setState({
						validated     : true,
						email         : (Bits.contains(status, 0x01)) ? email : 'Email Address Incorrect',
						password      : '',
						emailValid    : Bits.contains(status, 0x01),
						passwordValid : Bits.contains(status, 0x10),
						passMsg       : (Bits.contains(status, 0x10) || !Bits.contains(status, 0x01)) ? '' : 'Password Incorrect'
					});
				}

			}).catch((error)=> {
			});

		} else {
			this.setState({ validated : true });
		}
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { email, password, passMsg } = this.state;
		const { emailValid, passwordValid, validated } = this.state;

		return (<div className="login-form">
			<form onSubmit={this.handleSubmit}>
				<DummyForm />
				{(validated)
					? (<input type="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, passMsg : null, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" />)
					: (<input type="text" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, passMsg : null, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" />)
				}

				{(passMsg)
					? (<input type="email" placeholder="Enter Password" value={(passMsg || password)} onFocus={()=> this.setState({ passwordValid : true, passMsg : null })} onChange={(event)=> this.setState({ password : event.target.value, passMsg : null })} onClick={this.handlePassword} autoComplete="off" />)
					: (<input type="password" placeholder="Enter Password" value={(passMsg || password)} onFocus={()=> this.setState({ passwordValid : true, passMsg : null })} onChange={(event)=> this.setState({ password : event.target.value })} onClick={this.handlePassword} autoComplete="off" />)
				}

				<button disabled={(email.length === 0 || password.length === 0 || !emailValid || !passwordValid || passMsg)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Login</button>
			</form>
		</div>);
	}
}

export default LoginForm;
