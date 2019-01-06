
import React, { Component } from 'react';
import './LoginPage.css';

import axios from 'axios/index';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import { updateUserProfile } from '../../redux/actions';
import { hasBit, isValidEmail } from '../../utils/funcs';

const passwordTextfield = React.createRef();


function mapDispatchToProps(dispatch) {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
}


class LoginPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email         : '',
			password      : '',
			emailValid    : true,
			passwordValid : true,
			passMsg       : ''
		};
	}

	handlePassword = ()=> {
		this.setState({
			password      : '',
			passwordValid : true,
			passMsg       : ''
		});

		setTimeout(function() {
			passwordTextfield.current.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
		console.log('LoginPage.submit()');
		event.preventDefault();

		const { email, password } = this.state;

		const emailValid = (email.includes('@')) ? isValidEmail(email) : (email.length > 0);
		const passwordValid = (password.length > 0);

		this.setState({
			email         : (emailValid) ? email : 'Invalid Email or Username',
			passMsg       : (passwordValid) ? '' : 'Invalid Password',
			emailValid    : emailValid,
			passwordValid : passwordValid
		});

		if (emailValid && passwordValid) {
			let formData = new FormData();
			formData.append('action', 'LOGIN');
			formData.append('email', email);
			formData.append('password', password);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('LOGIN', response.data);
					const status = parseInt(response.data.status, 16);

					if (hasBit(status, 0x11)) {
						cookie.save('user_id', response.data.user_id, { path : '/' });

						this.props.updateUserProfile({
							id       : response.data.user_id,
							avatar   : response.data.avatar,
							username : response.data.username,
							email    : response.data.email,
							password : password
						});

						this.props.onPage('');

					} else {
						this.setState({
							email         : hasBit(status, 0x01) ? email : 'Wrong Email or Username',
							password      : '',
							emailValid    : hasBit(status, 0x01),
							passwordValid : hasBit(status, 0x10),
							passMsg       : hasBit(status, 0x10) ? '' : 'Wrong Password'
						});
					}
				}).catch((error) => {
			});
		}
	};


	render() {
		const { email, password } = this.state;
		const { emailValid, passwordValid, passMsg } = this.state;

		const title = (typeof cookie.load('msg') === 'undefined') ? 'Login' : 'You must be signed in to ' + cookie.load('msg');

		const emailClass = (emailValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
		const passwordClass = (passwordValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
		const buttonClass = (emailValid && passwordValid) ? 'fat-button adjacent-button' : 'fat-button adjacent-button button-disabled';

		if (typeof cookie.load('msg') !== 'undefined') {
			cookie.remove('msg');
		}

		return (
			<div className="page-wrapper login-page-wrapper">
				<h3>{title}</h3>
				<h4>Enter the email address of each member of your team to invite them to this project.</h4>
				<div className="login-page-form-wrapper">
					<form onSubmit={this.handleSubmit}>
						<div className={emailClass}><input type="text" name="email" placeholder="Enter Email or Username" value={email} onFocus={()=> this.setState({ email : '', emailValid : true })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={passwordClass} onClick={()=> this.handlePassword()}>
							<input type="password" name="password" placeholder="Enter Password" value={password} style={{ display : (passwordValid) ? 'block' : 'none' }} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} ref={passwordTextfield} />
							<div className="field-error" style={{ display : (!passwordValid) ? 'block' : 'none' }}>{passMsg}</div>
						</div>
						<Row vertical="center">
							<Column><button type="submit" className={buttonClass} onClick={(event)=> this.handleSubmit(event)}>Submit</button></Column>
							<Column><div className="page-link" style={{ fontSize : '14px' }} onClick={()=> this.props.onPage('recover')}>Forgot Password?</div></Column>
						</Row>
					</form>
				</div>
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(LoginPage);
