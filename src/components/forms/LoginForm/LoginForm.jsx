
import React, { Component } from 'react';
import './LoginForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';
import { Row } from 'simple-flexbox';

import { Modals, API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


const passwordTextfield = React.createRef();

const txtfieldClass = (isValid)=> {
	return ((isValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error');
};


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
	}

	componentDidMount() {
// 		console.log('LoginForm.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('LoginForm.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (prevProps.email !== this.props.email) {
			const { email } = this.props;
			this.setState({ email });
		}
	}

	componentWillUnmount() {
// 		console.log('LoginForm.componentWillUnmount()');
	}

	handlePassword = ()=> {
// 		console.log('LoginForm.handlePassword()');

		this.setState({
			password      : '',
			passwordValid : true,
			passMsg       : ''
		});

		setTimeout(()=> {
			passwordTextfield.current.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
		console.log('LoginForm.handleSubmit()', event.target, this.state);
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
// 		console.log('LoginForm.render()', this.props, this.state);

		const { title } = this.props;
		const { email, password } = this.state;
		const { emailValid, passwordValid, passMsg } = this.state;

		const emailClass = txtfieldClass(emailValid);
		const passwordClass = txtfieldClass(passwordValid);

		return (
			<div className="login-form-wrapper">
				{(title && title.length > 0) && (<h4>{title}</h4>)}
				<form onSubmit={this.handleSubmit}>
					<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : '', emailValid : true })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					<div className={passwordClass} onClick={()=> this.handlePassword()}>
						<input type="password" name="password" placeholder="Enter Password" value={password} style={{ display : (passwordValid) ? 'block' : 'none' }} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} ref={passwordTextfield} />
						<div className="field-error" style={{ display : (!passwordValid) ? 'block' : 'none' }}>{passMsg}</div>
					</div>
					<Row vertical="center">
						{/*{(!window.location.href.includes('/login')) && (<button className="adjacent-button" onClick={this.props.onCancel}>Cancel</button>)}*/}
						<button disabled={(email.length === 0 || !emailValid || !passwordValid)} type="submit" className="adjacent-button" onClick={(event)=> this.handleSubmit(event)}>Login</button>
						<button className="long-button aux-button adjacent-button" onClick={(event)=> { event.preventDefault(); trackEvent('button', 'github'); this.props.onPage(`/modal${Modals.GITHUB_CONNECT}`); }}>Login w/ GitHub</button>
						<div className="page-link page-link-form" onClick={()=> {trackEvent('button', 'forgot-password'); this.props.onPage('/recover')}}>Forgot Password?</div>
					</Row>
				</form>
			</div>
		);
	}
}

export default LoginForm;
