
import React, { Component } from 'react';
import './Overlay.css';

import axios from 'axios';
import cookie from 'react-cookies';
import FontAwesome from 'react-fontawesome';
import { Row, Column } from 'simple-flexbox';

class RegisterOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			action        : '',
			emailValid    : false,
			passwordValid : false,
			email1        : '',
			password1     : '',
			email2        : '',
			password2     : ''
		};
	}

	submit = ()=> {
		console.log('submit()');
		const action = (this.state.email1.length > 0) ? 'REGISTER' : (this.state.email2.length > 0) ? 'LOGIN' : '';
		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		let email = '';
		let password = '';

		if (action === 'REGISTER') {
			email = this.state.email1;
			password = this.state.password1;

		} else if (action === 'LOGIN') {
			email = this.state.email2;
			password = this.state.password2;
		}

		const isEmailValid = re.test(String(email).toLowerCase());
		const isPasswordValid = (password.length > 0);

		this.setState({
			action        : action,
			emailValid    : isEmailValid,
			passwordValid : isPasswordValid
		});

		if (isEmailValid && isPasswordValid) {
			let formData = new FormData();
			formData.append('action', action);
			formData.append('email', email);
			formData.append('password', password);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log(action, response.data);
					if (response.data.status === true) {
						cookie.save('user_id', response.data.user_id, { path : '/' });
						formData.append('action', 'SYSTEM_FILE');
						formData.append('user_id', cookie.load('user_id'));
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response)=> {
								console.log('SYSTEM_FILE', response.data);
								cookie.save('upload_id', response.data.upload_id, { path : '/' });
								cookie.save('system', response.data.system, { path : '/' });
								cookie.save('author', response.data.author, { path : '/' });
								this.props.onClick('submit');

							}).catch((error) => {
						});

					} else {
						this.setState({
							emailValid    : false,
							passwordValid : false
						});
					}
				}).catch((error) => {
			});
		}
	};

	render() {
		const email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'REGISTER' && !this.state.emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const password1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'REGISTER' && !this.state.passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const password2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		return (
			<div className="overlay-wrapper">
				<div className="overlay-container">
					<div className="overlay-logo-wrapper"><img src="/images/logo.svg" className="overlay-logo" alt="Design Engine" /></div>
					<div className="overlay-title">To Sign In or Sign Up for Design Engine, enter an email &amp; password below.</div>
					<div className="overlay-content">
						<div className="input-title">Sign Up</div>
						<div className={email1Class}><input type="text" name="email1" placeholder="Email Address" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={password1Class}><input type="password" name="password1" placeholder="Password" value={this.state.password1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>

						<div className="input-title">Sign In</div>
						<div className={email2Class}><input type="text" name="email2" placeholder="Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={password2Class}><input type="password" name="password2" placeholder="Password" value={this.state.password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					</div>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> this.submit()}><Row>
							<Column flexGrow={1} horizontal="start" vertical="center">Submit</Column>
							<Column flexGrow={1} horizontal="end" vertical="center"><FontAwesome name="caret-right" className="overlay-button-confirm-arrow" /></Column>
						</Row></button>
						<button className="overlay-button overlay-button-cancel" onClick={()=> this.props.onClick('cancel')}>Cancel</button>
					</div>
				</div>
			</div>
		);
	}
}

export default RegisterOverlay;
