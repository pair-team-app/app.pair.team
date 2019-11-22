
import React, { Component } from 'react';
import './RegisterForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';

import DummyForm from '../../forms/DummyForm';
import { API_ENDPT_URL } from '../../../consts/uris';


class RegisterForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inviteID      : props.inviteID,
			email         : (props.email || ''),
			password      : '',
			password2     : '',
			passMsg       : null,
			emailValid    : true,
			passwordValid : true,
			validated     : false
		};

		this.passwordTextfield = React.createRef();
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
			passMsg       : null
		});

		setTimeout(() => {
			this.passwordTextfield.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
// 		console.log('%s.handleSubmit()', this.constructor.name, event.target);
		event.preventDefault();

		const { inviteID, email, password, password2 } = this.state;
		const emailValid = Strings.isEmail(email);
		const passwordValid = (password.length > 0 && password === password2);

		this.setState({
			email         : (emailValid) ? email : 'Email Address Invalid',
			passMsg       : (passwordValid) ? '' : 'Passwords don\'t match',
			emailValid    : emailValid,
			passwordValid : passwordValid
		});


		if (emailValid && passwordValid) {
			axios.post(API_ENDPT_URL, {
				action  : 'REGISTER',
				payload : { email, password, inviteID,
					username : email,
					type     : 'free_user'
				}
			}).then((response) => {
				console.log('REGISTER', response.data);
				const status = parseInt(response.data.status, 16);
// 				console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

				if (status === 0x11) {
					this.props.onRegistered(response.data.user);

				} else {
					this.setState({
						validated  : true,
						email      : Bits.contains(status, 0x01) ? email : 'Email Address Already in Use',
						password   : '',
						password2  : '',
						emailValid : Bits.contains(status, 0x01)
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

		const { email, password, password2, passMsg } = this.state;
		const { emailValid, passwordValid, validated } = this.state;

		return (
			<div className="register-form">
				<form onSubmit={this.handleSubmit}>
					<DummyForm />

					{(validated)
						? (<input type="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" required />)
						: (<input type="text" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" />)
					}

					{(passMsg)
						? (<input type="email" placeholder="Enter Password" value={passMsg} onFocus={()=> this.setState({ passMsg : null })} onChange={(event)=> this.setState({ password : event.target.value, passMsg : null })} onClick={this.handlePassword} ref={(element)=> this.passwordTextfield = element} autoComplete="off" required />)
						: (<input type="password" placeholder="Enter Password" value={password} onChange={(event)=> this.setState({ password : event.target.value, passMsg : null })} onClick={this.handlePassword} ref={(element)=> { this.passwordTextfield = element }} autoComplete="off" />)
					}

					{(passMsg)
						? (<input type="email" placeholder="Confirm Password" value={passMsg} onChange={(event)=> this.setState({ password2 : event.target.value })} autoComplete="off" required />)
						: (<input type="password" placeholder="Confirm Password" value={password2} onChange={(event)=> this.setState({ password2 : event.target.value })} autoComplete="off" />)
					}

					<button disabled={(email.length === 0 || password.length === 0 || password2.length === 0 || !emailValid || !passwordValid || password !== password2)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Sign Up</button>
				</form>
			</div>
		);
	}
}

export default RegisterForm;
