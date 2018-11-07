
import React, { Component } from 'react';
import './Overlay.css';

import axios from 'axios';
import cookie from 'react-cookies';
import Dropzone from 'react-dropzone';
import { Row } from 'simple-flexbox';

const titleTextfield = React.createRef();

class UploadOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			uploadID           : 0,
			title              : '',
			status             : '',
			description        : '',
			files              : [],
			uploading          : false,
			uploadComplete     : false,
			processingComplete : false,
			percent            : 0,
			action             : '',
			email1             : '',
			email2             : '',
			email3             : '',
			email1Valid        : false,
			email2Valid        : false,
			email3Valid        : false
		};

		this.uploadInterval = null;
	}

	onDragEnter() {}
	onDragLeave() {}

	onDrop(files) {
		console.log('onDrop()', files);
		this.setState({
			files     : files,
			title     : files[0].name.split('.').slice(0, -1).join(),
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

		titleTextfield.current.focus();
		titleTextfield.current.select();
	}

	onUploadComplete = ()=> {
		this.setState({
			uploading      : false,
			uploadComplete : true
		});
	};

	handleBackgroundClose = () => {
		if (this.state.uploadComplete && this.state.files.length > 0) {
			this.handleCancel();

		} else {
			clearInterval(this.uploadInterval);
			this.props.onClick('background');
		}
	};

	handleCancel = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOAD_CANCEL');
		formData.append('upload_id', '' + this.state.uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_CANCEL', response.data);
				clearInterval(this.uploadInterval);
				cookie.save('upload_id', '0', { path : '/' });
				this.props.onClick('cancel');
			}).catch((error) => {
		});
	};

	handleSubmit = ()=> {
		if (this.state.uploadComplete) {
			let formData = new FormData();
			formData.append('action', 'UPLOAD');
			formData.append('user_id', cookie.load('user_id'));
			formData.append('title', this.state.title);
			formData.append('description', this.state.description);
			formData.append('filename', "http://cdn.designengine.ai/system/" + this.state.files[0].name);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPLOAD', response.data);
					cookie.save('upload_id', response.data.upload_id, { path : '/' });
					this.setState({
						uploadID : response.data.upload_id,
						files    : []
					});

					let self = this;
					this.uploadInterval = setInterval(function() {
						self.statusInterval();
					}, 1000);
				}).catch((error) => {
			});
		}
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

				}).catch((error) => {
			});
		}
	};

	statusInterval = ()=> {
		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', '' + this.state.uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_STATUS', response.data);
				this.setState({ status : response.data.type + response.data.message });
				if (response.data.message === 'Processing complete') {
					clearInterval(this.uploadInterval);
					this.setState({ processingComplete : true });
					this.props.onClick('complete');
				}
			}).catch((error) => {
		});
	};

	render() {
		const { email1, email2, email3 } = this.state;
		const { email1Valid, email2Valid, email3Valid } = this.state;

		const progressStyle = { width : this.state.percent + '%' };

		const email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !email1Valid && email1.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !email2Valid && email2.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email3Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !email3Valid && email3.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const titleClass = 'input-wrapper';
		const descriptionClass = 'input-wrapper';

		const nextButtonClass = (this.state.uploadComplete && this.state.title.length > 0) ? 'overlay-button' : 'overlay-button button-disabled';
		const inviteButtonClass = (email1.length > 0 || email2.length > 0 || email3.length > 0) ? 'overlay-button' : 'overlay-button button-disabled';

		const title = (this.state.uploading) ? 'Loading ' + this.state.percent + '%…' : (this.state.uploadComplete) ? (this.state.files.length === 0) ? (this.state.processingComplete) ? 'Processing complete' : this.state.status : 'Enter details to start processing' : 'Drag here to start upload';
		return (
			<div className="overlay-wrapper">
				<div className="overlay-close-background" onClick={()=> this.handleBackgroundClose()} />
				{(this.state.uploading) && (
					<div className="overlay-progress-wrapper">
						<div className="overlay-progress" style={progressStyle}>
						</div>
					</div>
				)}
				<div className="overlay-container"><Row horizontal="center">
					<div className="overlay-content">
						<div style={{width:'100%', height:'100%'}}>
							<Dropzone
								disableClick
								style={{position:'relative'}}
								onDrop={this.onDrop.bind(this)}
								onDragEnter={this.onDragEnter.bind(this)}
								onDragLeave={this.onDragLeave.bind(this)}>
									<div className="page-header">
										<Row horizontal="center"><div className="page-header-text">{title}</div></Row>
										<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
										<Row horizontal="center"><button className="page-button" onClick={()=> this.handleCancel()}>Cancel</button></Row>
									</div>
								</Dropzone>
						</div>

						{(cookie.load('user_id') !== '0') && (<div>
							{(this.state.uploadComplete && this.state.files.length === 0)
								? (<div>
										<div className="input-title">Invite your teammates</div>
										<div className={email1Class}><input type="text" name="email1" placeholder="Enter Email Address" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
										<div className={email2Class}><input type="text" name="email2" placeholder="Enter Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
										<div className={email3Class}><input type="text" name="email3" placeholder="Enter Email Address" value={this.state.email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
										<div className="overlay-button-wrapper"><button className={inviteButtonClass} onClick={() => this.handleInvite()}>Invite these people</button></div>
									</div>)
								: (<div>
										<div className="input-title">Setup your project</div>
										<div className={titleClass}><input type="text" name="title" placeholder="Enter project name" value={this.state.title} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} ref={titleTextfield} /></div>
										<div className={descriptionClass}><input type="text" name="description" placeholder="Enter project description" value={this.state.description} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
										<div className="overlay-button-wrapper"><button className={nextButtonClass} onClick={() => this.handleSubmit()}>Next</button></div>
									</div>
								)
							}
						</div>)}
					</div>
				</Row></div>
			</div>
		);
	}
}

export default UploadOverlay;