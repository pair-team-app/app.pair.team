
import React, { Component } from 'react';
import './Overlay.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { Row } from 'simple-flexbox';

class InviteOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			action        : '',
			email         : '',
			password      : '',
			email1        : '',
			email2        : '',
			email3        : '',
			emailValid    : false,
			passwordValid : false,
			email1Valid   : false,
			email2Valid   : false,
			email3Valid   : false
		};
	}

	submit = ()=> {
		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi;
		const isEmailValid = (re.test(String(this.state.email).toLowerCase()) || cookie.load('user_id' !== '0'));
		const isPassword = (this.state.password.length > 0 || cookie.load('user_id' !== '0'));
		const isEmail1Valid = re.test(String(this.state.email1).toLowerCase());
		const isEmail2Valid = re.test(String(this.state.email2).toLowerCase());
		const isEmail3Valid = re.test(String(this.state.email3).toLowerCase());

		this.setState({
			action      : (this.state.email.length > 0) ? 'LOGIN' : 'INVITE',
			email1Valid : isEmail1Valid,
			email2Valid : isEmail2Valid,
			email3Valid : isEmail3Valid
		});

		if (isEmailValid && isPassword) {
			let formData = new FormData();
			formData.append('action', 'LOGIN');
			formData.append('email', this.state.email);
			formData.append('password', this.state.password);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('LOGIN', response.data);
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

								let emails = '';
								if (isEmail1Valid) {
									emails += this.state.email1 + ' ';
								}

								if (isEmail2Valid) {
									emails += this.state.email2 + ' ';
								}

								if (isEmail3Valid) {
									emails += this.state.email3;
								}

								if (isEmail1Valid || isEmail2Valid || isEmail3Valid) {
									let formData = new FormData();
									formData.append('action', 'INVITE');
									formData.append('user_id', cookie.load('user_id'));
									formData.append('emails', emails);
									axios.post('https://api.designengine.ai/system.php', formData)
										.then((response) => {
											console.log('INVITE', response.data);
											this.props.onClick('submit');
										}).catch((error) => {
									});
								}

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

		} else {
			let emails = '';
			if (isEmail1Valid) {
				emails += this.state.email1 + " ";
			}

			if (isEmail2Valid) {
				emails += this.state.email2 + " ";
			}

			if (isEmail3Valid) {
				emails += this.state.email3;
			}

			if (isEmail1Valid || isEmail2Valid || isEmail3Valid) {
				let formData = new FormData();
				formData.append('action', 'INVITE');
				formData.append('user_id', cookie.load('user_id'));
				formData.append('emails', emails);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('INVITE', response.data);
						this.props.onClick('submit');
					}).catch((error) => {
				});
			}
		}
	};

	render() {
		const emailClass = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const passwordClass = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email1Valid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email2Valid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email3Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email3Valid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		return (
			<div className="overlay-wrapper">
				<div className="overlay-container"><Row horizontal="center">
					<div className="overlay-content">
						<div className="page-header">
							<Row horizontal="center"><div className="page-header-text">Invite Everyone</div></Row>
							<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.
							</div>
							<Row horizontal="center"><button className="page-button" onClick={()=> this.props.onClick('cancel')}>Cancel</button></Row>
						</div>
						{(cookie.load('user_id') === '0') && (<div>
							<div className="input-title">Enter details</div>
							<div className={emailClass}><input type="text" name="email2" placeholder="Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<div className={passwordClass}><input type="password" name="password2" placeholder="Password" value={this.state.password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						</div>)}
						<div className="input-title">Invite team members</div>
						<div className={email1Class}><input type="text" name="email1" placeholder="Engineer Email" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={email2Class}><input type="text" name="email2" placeholder="Engineer Email" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={email3Class}><input type="text" name="email3" placeholder="Engineer Email" value={this.state.email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className="overlay-button-wrapper">
							<button className="overlay-button overlay-button-confirm" onClick={()=> this.submit()}>Submit</button>
						</div>
					</div>
				</Row></div>
			</div>
		);
	}
}

export default InviteOverlay;
