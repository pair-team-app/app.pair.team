
import React, { Component } from 'react';
import './Overlay.css';

import axios from 'axios';
import cookie from 'react-cookies';
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
						formData.append('action', 'UPLOADS');
						formData.append('user_id', cookie.load('user_id'));
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response)=> {
								console.log('UPLOADS', response.data);
								if (response.data.uploads.length > 0) {
									cookie.save('upload_id', response.data.uploads[0].id, { path : '/' });
									cookie.save('system', response.data.uploads[0].title, { path : '/' });
									cookie.save('author', response.data.uploads[0].author, { path : '/' });
								}
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
					<div className="overlay-content">
						<div className="page-header">
							<Row horizontal="center"><div className="page-header-text">You need to be signed in</div></Row>
							<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button className="page-button" onClick={()=> this.props.onClick('cancel')}>Cancel</button></Row>
						</div>

						<div className="input-title">Sign Up</div>
						<div className={email1Class}><input type="text" name="email1" placeholder="Email Address" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={password1Class}><input type="password" name="password1" placeholder="Password" value={this.state.password1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>

						<div className="input-title">Sign In</div>
						<div className={email2Class}><input type="text" name="email2" placeholder="Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={password2Class}><input type="password" name="password2" placeholder="Password" value={this.state.password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					</div>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> this.submit()}>Submit</button>
					</div>
				</div>
			</div>
		);
	}
}

export default RegisterOverlay;
