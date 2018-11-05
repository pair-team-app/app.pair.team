
import React, { Component } from 'react';
import './Overlay.css';

import axios from 'axios';
import cookie from 'react-cookies';
import Dropzone from 'react-dropzone';
import { Row } from 'simple-flexbox';

class UploadOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title          : '',
			status         : '',
			description    : '',
			files          : [],
			uploading      : false,
			uploadComplete : false,
			percent        : 0,
			action         : '',
			email1         : '',
			email2         : '',
			email3         : '',
			email1Valid    : false,
			email2Valid    : false,
			email3Valid    : false
		};

		this.uploadInterval = null;
	}

	onDragEnter() {}
	onDragLeave() {}

	onDrop(files) {
		console.log('onDrop()', files);
		this.setState({
			files,
			uploading : true,
			action    : ''
		});

		let self = this;
		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}, onUploadProgress: function(progressEvent) {
				const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				self.setState({ percent : percent });

				if (progressEvent.loaded === progressEvent.total) {
					self.onUploadComplete();
				}
			}
		};

		this.state.files.forEach(file => {
			let formData = new FormData();
			formData.append('file', file);

			axios.post('http://cdn.designengine.ai/upload.php?dir=%2Fsystem', formData, config)
				.then((response)=>{
					console.log("UPLOAD", response.data);
				}).catch((error) => {
			});
		});
	}

	onUploadComplete = ()=> {
		this.setState({
			uploading      : false,
			uploadComplete : true
		});

		let formData = new FormData();
		formData.append('action', 'UPLOAD');
		formData.append('user_id', cookie.load('user_id'));
		formData.append('title', this.state.title);
		formData.append('filename', "http://cdn.designengine.ai/system/" + this.state.files[0].name);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD', response.data);
				cookie.save('upload_id', response.data.upload_id, { path : '/' });

				let self = this;
				this.uploadInterval = setInterval(function() {
					self.statusInterval();
				}, 1000);
			}).catch((error) => {
		});
	};

	statusInterval = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', cookie.load('upload_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_STATUS', response.data);
				if (response.data.message === 'Processing complete') {
					clearInterval(this.uploadInterval);
				}

				this.setState({ status : response.data.message });
			}).catch((error) => {
		});
	};

	handleLogin = ()=> {

	};

	handleInvite = ()=> {
		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
					this.props.onClick('submit');
				}).catch((error) => {
			});
		}
	};

	submit = ()=> {
		if (this.state.uploadComplete) {
			let formData = new FormData();
			formData.append('action', 'UPLOAD_EDIT');
			formData.append('upload_id', cookie.load('upload_id'));
			formData.append('title', this.state.title);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPLOAD_EDIT', response.data);
				}).catch((error) => {
			});
		}
	};

	render() {
		const progressStyle = { width : this.state.percent + '%' };

		const emailClass = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const passwordClass = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'LOGIN' && !this.state.passwordValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email1Valid && this.state.email1.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email2Valid && this.state.email2.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email3Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email3Valid && this.state.email3.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const titleClass = 'input-wrapper';
		const descriptionClass = 'input-wrapper';

		const nextButtonClass = (this.state.uploadComplete) ? 'overlay-button overlay-button-confirm' : 'overlay-button overlay-button-confirm overlay-button-confirm-disabled';

// 		const { files } = this.state;
		const title = (cookie.load('user_id') !== '0') ? (this.state.uploading) ? 'Loading ' + this.state.percent + '%…' : (this.state.uploadComplete) ? this.state.status : 'Drag anywhere to start upload' : 'You need to be signed in';
		return (
			<Dropzone
				disableClick
				style={{position: "relative"}}
				onDrop={this.onDrop.bind(this)}
				onDragEnter={this.onDragEnter.bind(this)}
				onDragLeave={this.onDragLeave.bind(this)}>
				<div className="overlay-wrapper">
					{(this.state.uploading) && (
						<div className="overlay-progress-wrapper">
							<div className="overlay-progress" style={progressStyle}>
							</div>
						</div>
					)}
					<div className="overlay-container"><Row horizontal="center">
						<div className="overlay-close-background" onClick={()=> this.props.onClick('cancel')} />
						<div className="overlay-content">
							<div className="page-header">
								<Row horizontal="center"><div className="page-header-text">{title}</div></Row>
								<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
								<Row horizontal="center"><button className="page-button" onClick={()=> this.props.onClick('cancel')}>Cancel</button></Row>
							</div>

							{(cookie.load('user_id') !== '0') && (<div>
								{(this.state.files.length === 0)
									? (<div>
											<div className="input-title">Invite your teammates</div>
											<div className={email1Class}><input type="text" name="email1" placeholder="Enter Email Address" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
											<div className={email2Class}><input type="text" name="email2" placeholder="Enter Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
											<div className={email3Class}><input type="text" name="email3" placeholder="Enter Email Address" value={this.state.email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
										</div>)
									: (<div>
											<div className="input-title">Setup your project</div>
											<div className={titleClass}><input type="text" name="title" placeholder="Enter project name" value={this.state.title} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
											<div className={descriptionClass}><input type="text" name="description" placeholder="Enter project description" value={this.state.description} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
										</div>
									)
								}
							</div>)}

							{(cookie.load('user_id') === '0') && (<div>
								<div className="input-title">Sign In</div>
								<div className={emailClass}><input type="text" name="email" placeholder="Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
								<div className={passwordClass}><input type="password" name="password" placeholder="Password" value={this.state.password2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							</div>)}

							{(cookie.load('user_id') !== '0') && (
								<div className="overlay-button-wrapper">
									{(this.state.files.length > 0)
										? (<button className={nextButtonClass} onClick={() => this.submit()}>Next</button>)
										: (<button className="overlay-button overlay-button-confirm" onClick={() => this.handleInvite()}>Invite these people</button>)
									}
								</div>
							)}

							{(cookie.load('user_id') === '0') && (
								<div className="overlay-button-wrapper">
									<button className="overlay-button overlay-button-confirm" onClick={()=> this.handleLogin()}>Submit</button>
								</div>
							)}
						</div>
					</Row></div>
				</div>
			</Dropzone>
		);
	}
}

export default UploadOverlay;