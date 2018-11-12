
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import { Column, Row } from 'simple-flexbox';

import RadioButton from '../elements/RadioButton';

const dzWrapper = React.createRef();
const titleTextfield = React.createRef();

class UploadPage extends Component {
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
			sentInvites        : false,
			uploadURL          : '',
			percent            : 0,
			action             : '',
			email1             : '',
			email2             : '',
			email3             : '',
			email1Valid        : false,
			email2Valid        : false,
			email3Valid        : false,
			radioButtons       : [{
				id       : 1,
				title    : 'Public Project',
				selected : true,
				enabled  : true
			}, {
				id       : 2,
				title    : 'Private Project (soon)',
				selected : false,
				enabled  : false
			}]
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
			action    : 'UPLOAD'
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

	handleCancel = (event)=> {
		console.log('handleCancel()', event);
		event.preventDefault();
		event.stopPropagation();

		let formData = new FormData();
		formData.append('action', 'UPLOAD_CANCEL');
		formData.append('upload_id', '' + this.state.uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_CANCEL', response.data);
				clearInterval(this.uploadInterval);
				cookie.save('upload_id', '0', { path : '/' });
				this.props.onCancel();
			}).catch((error) => {
		});
	};

	handleRadioButton = (radioButton)=> {
		let radioButtons = [...this.state.radioButtons];
		radioButtons.forEach((item)=> {
			item.selected = (item.id === radioButton.id);
		});

		this.setState({ radioButtons : radioButtons });
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
						uploadID  : response.data.upload_id,
						uploadURL : 'https://earlyaccess.designengine.ai/doc/' + response.data.upload_id + '/' + this.state.title.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase(),
						files     : []
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

			this.setState({ sentInvites : true });
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
					//this.props.onClick('complete');
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

		const titleClass = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'UPLOAD' && this.state.title === '') ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const nextButtonClass = (this.state.uploadComplete && this.state.title.length > 0) ? '' : 'button-disabled';
		const inviteButtonClass = (email1.length > 0 || email2.length > 0 || email3.length > 0) ? '' : 'button-disabled';

		const title = (this.state.uploading) ? 'Uploading ' + this.state.title + '…' : (this.state.uploadComplete) ? (this.state.files.length === 0) ? (this.state.processingComplete) ? 'Project ready' : this.state.status : 'Enter details to start processing' : 'Drag & drop your design file';


		const radioButtons = this.state.radioButtons.map((radioButton, i)=> {
			return (
				<Column key={i}>
					<RadioButton
						key={i}
						enabled={radioButton.enabled}
						selected={radioButton.selected}
						title={radioButton.title}
						onClick={()=> this.handleRadioButton(radioButton)}
					/>
				</Column>
			);
		});

		return (
			<div className="page-wrapper upload-page-wrapper">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<Dropzone
							ref={dzWrapper}
							className="upload-page-dz-wrapper"
							onDrop={this.onDrop.bind(this)}
							onDragEnter={this.onDragEnter.bind(this)}
							onDragLeave={this.onDragLeave.bind(this)}>
							<div className="page-header upload-page-header">
								<div className="upload-page-progress-wrapper">
									{(this.state.uploading) && (
										<div className="upload-page-progress" style={progressStyle}>
										</div>
									)}
								</div>
								<Row horizontal="center"><h1>{title}</h1></Row>
								<div className="page-header-text">{(this.state.uploading || this.state.uploadComplete) ? 'Or cancel your Sketch file upload' :'Or choose your file'}</div>

								{(this.state.uploadComplete && this.state.files.length === 0 && !this.state.processingComplete)
									? (<div>
											<Row horizontal="center">
												<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.uploadURL}>
													<button>Copy Project Link</button>
												</CopyToClipboard>
											</Row>
											<Row horizontal="center"><div className="page-header-url">
												<a href={this.state.uploadURL} target="_blank" rel="noopener noreferrer">{this.state.uploadURL}</a>
											</div></Row>
										</div>)
									: (<Row horizontal="center"><button onClick={(event)=> this.handleCancel(event)}>Cancel</button></Row>)
								}
							</div>
						</Dropzone>

						{(!this.state.sentInvites) && (<div style={{width:'100%'}}>
							{(this.state.uploadComplete && this.state.files.length === 0)
								? (<div style={{width:'100%'}}>
									<div className={email1Class}><input type="text" name="email1" placeholder="Enter Team Member Email Address" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
									<div className={email2Class}><input type="text" name="email2" placeholder="Enter Team Member Email Address" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
									<div className={email3Class}><input type="text" name="email3" placeholder="Enter Team Member Email Address" value={this.state.email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
									<button className={inviteButtonClass} onClick={() => this.handleInvite()}>Send Invites</button>
								</div>)
								: (<div className="upload-page-form-wrapper">
										<div className={titleClass}><input type="text" name="title" placeholder="Project Title" value={this.state.title} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} ref={titleTextfield} /></div>
										<div className="input-wrapper"><input type="text" name="description" placeholder="Project Description" value={this.state.description} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
										<Row horizontal="start" style={{flexWrap:'wrap'}}>
											{radioButtons}
										</Row>
										<button className={nextButtonClass} onClick={() => this.handleSubmit()}>Next</button>
									</div>
								)
							}
						</div>)}

						{(this.state.sentInvites) && (<h4>Invites will be sent once your file has been processed.</h4>)}
						{(this.state.processingComplete) && (<Row horizontal="start"><button onClick={() => this.props.onPage('')}>Get Started</button></Row>)}

					</Column>
				</Row>
			</div>
		);
	}
}

export default UploadPage;