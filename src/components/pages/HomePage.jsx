
import React, { Component } from 'react';
import './HomePage.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';


class HomePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action        : '',
			emailValid    : false,
			passwordValid : false,
			email1        : '',
			password1     : '',
			email2        : '',
			password2     : '',
			email3        : '',
			email3Valid   : false,

			title         : 'Loading Project…',
			uploadURL     : '',
			artboards     : []
		};
	}

	componentDidMount() {
		console.log('HomePage().componentDidMount()', this.props);
		if (this.props.uploadID !== 0) {
			this.refreshData();
		}
	}

	componentDidUpdate(prevProps) {
		console.log('HomePage.componentDidUpdate()', this.props, prevProps);
		if (this.props.uploadID !== prevProps.uploadID || this.props.pageID !== prevProps.pageID) {
			this.refreshData();
			return (null);
		}
	}

	refreshData = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOAD_NAMES');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_NAMES', response.data);
				let self = this;
				let title = '';
				let uploadURL = '';
				response.data.uploads.forEach(function(upload, i) {
					if (upload.id === self.props.uploadID) {
						title = upload.title;
						uploadURL = 'https://earlyaccess.designengine.ai/doc/' + self.props.uploadID + '/' + upload.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase();
					}
				});

				formData.append('action', 'ARTBOARDS');
				formData.append('upload_id', this.props.uploadID);
				formData.append('page_id', this.props.pageID);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('ARTBOARDS', response.data);

						const artboards = response.data.artboards.map((item) => ({
							id       : item.id,
							pageID   : item.page_id,
							title    : item.title,
							type     : item.type,
							filename : item.filename,
							meta     : JSON.parse(item.meta),
							added    : item.added,
							selected : false
						}));


						this.setState({
							title     : title,
							uploadURL : uploadURL,
							artboards : artboards
						});


					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	handleRegistrationSubmit = ()=> {
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
						window.location.reload();

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

	handleInviteSubmit = ()=> {
		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi;
		const isEmail1Valid = re.test(String(this.state.email1).toLowerCase());
		const isEmail2Valid = re.test(String(this.state.email2).toLowerCase());
		const isEmail3Valid = re.test(String(this.state.email3).toLowerCase());

		this.setState({
			action      : 'INVITE',
			email1Valid : isEmail1Valid,
			email2Valid : isEmail2Valid,
			email3Valid : isEmail3Valid
		});

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
				}).catch((error) => {
			});

			window.alert('Invite' + ((emails.includes(' ')) ? 's' : '') + ' sent!');
			this.setState({
				email1 : '',
				email2 : '',
				email3 : ''
			});
		}
	};

	handleURLCopy = ()=> {
		window.alert('URL copied to clipboard!');
	};


	render() {
		console.log('HomePage.render()', this.props);

		const artboards = this.state.artboards;
		const items = artboards.map((item, i, arr) => {
			if (item.type !== 'hero' && (this.props.pageID <= 0 || this.props.pageID === item.pageID)) {
				return (
					<Column key={i}>
						<ArtboardItem
							title={item.title}
							image={item.filename}
							size="landscape"//{(item.meta.frame.size.width > item.meta.frame.size.height || item.meta.frame.size.width === item.meta.frame.size.height) ? 'landscape' : 'portrait'}
							onClick={() => this.props.onArtboardClicked(item)} />
					</Column>
				);

			} else {
				return (null);
			}
		});

		let email1Class = '';
		let password1Class = '';
		let email2Class = '';
		let password2Class = '';
		let email3Class = '';

		if (parseInt(cookie.load('user_id'), 10) === 0) {
			email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'REGISTER' && !this.state.emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
			password1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'REGISTER' && !this.state.passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

			email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
			password2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		} else {
			email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email1Valid && this.state.email1.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
			email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email2Valid && this.state.email2.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
			email3Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email3Valid && this.state.email3.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		}

		return (
			<div className="home-page-wrapper">
				{(parseInt(cookie.load('user_id'), 10) === 0 && parseInt(this.props.uploadID, 10) === 0) && (<div>
					<Row vertical="start">
						<Column flexGrow={1} horizontal="center">
							<div className="page-header">
								<Row horizontal="center"><div className="page-header-text">Logged out</div></Row>
								<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
								<Row horizontal="center"><button className="page-button" onClick={()=> window.open('https://www.youtube.com')}>Watch Video</button><button onClick={()=> window.location.href = '/mission'}>Mission</button></Row>
							</div>
						</Column>
					</Row>
					<div className="home-page-form-wrapper">
						<div className="input-title">Sign Up</div>
						<div className={email1Class}><input type="text" name="email1" placeholder="Email Address" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={password1Class}><input type="password" name="password1" placeholder="Password" value={this.state.password1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>

						<div className="input-title">Sign In</div>
						<div className={email2Class}><input type="text" name="email2" placeholder="Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={password2Class}><input type="password" name="password2" placeholder="Password" value={this.state.password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className="overlay-button-wrapper">
							<button className="overlay-button overlay-button-confirm" onClick={()=> this.handleRegistrationSubmit()}>Submit</button>
						</div>
					</div>
					<Row horizontal="space-between" style={{flexWrap:'wrap'}}>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
					</Row>
				</div>)}

				{(parseInt(cookie.load('user_id'), 10) !== 0 && parseInt(this.props.uploadID, 10) === 0) && (<div>
					<Row vertical="start">
						<Column flexGrow={1} horizontal="center">
							<div className="page-header">
								<Row horizontal="center"><div className="page-header-text">Logged In</div></Row>
								<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
								<Row horizontal="center"><button className="page-button" onClick={()=> window.open('https://www.youtube.com')}>Watch Video</button><button onClick={()=> window.location.href = '/mission'}>Mission</button></Row>
							</div>
						</Column>
					</Row>
					<div className="home-page-form-wrapper">
						<div className="input-title">Invite team members</div>
						<div className={email1Class}><input type="text" name="email1" placeholder="Engineer Email" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={email2Class}><input type="text" name="email2" placeholder="Engineer Email" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={email3Class}><input type="text" name="email3" placeholder="Engineer Email" value={this.state.email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className="overlay-button-wrapper">
							<button className="overlay-button overlay-button-confirm" onClick={()=> this.handleInviteSubmit()}>Submit</button>
						</div>
					</div>
					<Row horizontal="space-between" style={{flexWrap:'wrap'}}>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
						<Column className="mission-page-faq">
							<div className="mission-page-faq-title">Will Design Engine be a web app or desktop app?</div>
							<div className="mission-page-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
						</Column>
					</Row>
				</div>)}

				{(parseInt(cookie.load('user_id'), 10) !== 0 && parseInt(this.props.uploadID, 10) !== 0) && (<div>
					<Row vertical="start">
						<Column flexGrow={1} horizontal="center">
							<div className="page-header">
								<Row horizontal="center"><div className="page-header-text">{this.state.title}</div></Row>
								<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
								<Row horizontal="center">
									<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.uploadURL}>
										<button className="page-button">Copy Project Link</button>
									</CopyToClipboard>
								</Row>
								<Row horizontal="center"><div className="home-page-upload-url">
									<a href={this.state.uploadURL} target="_blank" rel="noopener noreferrer">{this.state.uploadURL}</a>
								</div></Row>
							</div>
						</Column>
					</Row>
					<Row horizontal="space-between" style={{flexWrap:'wrap'}}>
						{items}
					</Row>
				</div>)}
			</div>
		);
	}
}

export default HomePage;
