
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import { Column, Row } from 'simple-flexbox';

import BottomNav from '../elements/BottomNav';
import ArtboardItem from '../iterables/ArtboardItem';
import Popup from '../elements/Popup';
import RadioButton from '../elements/RadioButton';

const dzWrapper = React.createRef();
const titleTextfield = React.createRef();

class UploadPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			files              : [],
			percent            : 0,
			uploadID           : 0,
			uploadTitle        : '',
			description        : '',
			uploadURL          : '',
			processingState    : -1,
			status             : '',
			title              : '',
			totalElements      : 0,
			uploading          : false,
			uploadComplete     : false,
			submitted          : false,
			downloadComplete   : false,
			sentInvites        : false,
			action             : '',
			email1             : '',
			email2             : '',
			email3             : '',
			email1Valid        : false,
			email2Valid        : false,
			email3Valid        : false,
			artboards          : [],
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
			}],
			popup : {
				visible : false,
				content : ''
			}
		};

		this.uploadInterval = null;
	}

	onDragEnter() {}
	onDragLeave() {}

	onDrop(files) {
		console.log('onDrop()', files);
		if (files.length > 0 && files[0].name.split('.').pop() === 'sketch') {
			if (files[0].size < 100 * 1024 * 1024) {

				let formData = new FormData();
				formData.append('action', 'SLACK');
				formData.append('message', '*(' + cookie.load('user_id') + ')* *' + cookie.load('user_email') + '* started uploading file "_' + files[0].name + '_"');
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log("SLACK", response.data);
					}).catch((error) => {
				});


				this.setState({
// 					processingState : -1,
					files           : files,
					uploadTitle     : files[0].name.split('.').slice(0, -1).join(),
					uploading       : true,
					action          : 'UPLOAD'
				});

				let self = this;
				const config = {
					headers : {
						'content-type' : 'multipart/form-data'
					}, onUploadProgress : function (progressEvent) {
						const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						self.setState({ percent : percent });

						if (progressEvent.loaded === progressEvent.total) {
							let formData = new FormData();
							formData.append('action', 'SLACK');
							formData.append('message', '*(' + cookie.load('user_id') + ')* *' + cookie.load('user_email') + '* - "_' + files[0].name + '_" uploaded');
							axios.post('https://api.designengine.ai/system.php', formData)
								.then((response) => {
									console.log("SLACK", response.data);
								}).catch((error) => {
							});

							self.onUploadComplete();
						}
					}
				};

				files.forEach(file => {
					let formData = new FormData();
					formData.append('file', file);

					axios.post('http://cdn.designengine.ai/upload.php?dir=%2Fsystem', formData, config)
						.then((response) => {
							console.log("UPLOAD", response.data);
						}).catch((error) => {
						formData.append('action', 'SLACK');
						formData.append('message', '*' + cookie.load('user_email') + '* upload failed for file _' + files[0].name + '_');
						axios.post('https://api.designengine.ai/system.php', formData)
							.then((response) => {
								console.log("SLACK", response.data);
							}).catch((error) => {
						});
					});
				});

				titleTextfield.current.focus();
				titleTextfield.current.select();

			} else {
				const popup = {
					visible : true,
					content : 'error::File size must be under 100MB.'
				};
				this.setState({ popup : popup });
			}

		} else {
			let formData = new FormData();
			formData.append('action', 'SLACK');
			formData.append('message', '*(' + cookie.load('user_id') + ')* *' + cookie.load('user_email') + '* uploaded incompatible file "_' + files[0].name + '_"');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log("SLACK", response.data);
				}).catch((error) => {
			});

			const popup = {
				visible : true,
				content : (files[0].name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'error::Only Sketch files are support at this time.'
			};
			this.setState({ popup : popup });
		}
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
				this.props.onPage('//');
			}).catch((error) => {
		});
	};

	handleURLCopy = ()=> {
		const popup = {
			visible : true,
			content : 'Copied to Clipboard!'
		};
		this.setState({ popup : popup });
	};

	handleRadioButton = (radioButton)=> {
		let radioButtons = [...this.state.radioButtons];
		radioButtons.forEach((item)=> {
			item.selected = (item.id === radioButton.id);
		});

		this.setState({ radioButtons : radioButtons });
	};

	handleSubmit = ()=> {
		if (this.state.uploadComplete && !this.state.submitted) {
			this.setState({ submitted : true });
			let formData = new FormData();
			formData.append('action', 'UPLOAD');
			formData.append('user_id', cookie.load('user_id'));
			formData.append('title', this.state.uploadTitle);
			formData.append('description', this.state.description);
			formData.append('filename', "http://cdn.designengine.ai/system/" + this.state.files[0].name);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPLOAD', response.data);
					cookie.save('upload_id', response.data.upload_id, { path : '/' });
					this.setState({
						uploadID        : response.data.upload_id,
						uploadURL       : 'https://earlyaccess.designengine.ai/proj/' + response.data.upload_id + '/' + this.state.uploadTitle.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase(),
						processingState : 0,
						files           : []
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
				if (response.data.state === '3') {
					clearInterval(this.uploadInterval);
					window.location.href = 'proj/' + this.state.uploadID + '/' + this.state.uploadTitle.replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '').toLowerCase();
				}

				let status = response.data.message;
				let processingState = parseInt(response.data.state, 10);

				formData.append('action', 'ARTBOARDS');
				formData.append('upload_id', '' + this.state.uploadID);
				formData.append('page_id', '-1');
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
							status          : status,
							processingState : processingState,
							artboards       : artboards
						});
					}).catch((error) => {
				});
			}).catch((error) => {
		});
	};

	render() {
		console.log('render()', this.state);

		const { action } = this.state;
// 		const { email1, email2, email3, email1Valid, email2Valid, email3Valid } = this.state;
		const { uploading, uploadComplete } = this.state;
		const { processingState } = this.state;

		const progressStyle = { width : this.state.percent + '%' };

// 		const email1Class = (action === '') ? 'input-wrapper' : (action === 'INVITE' && !email1Valid && email1.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
// 		const email2Class = (action === '') ? 'input-wrapper' : (action === 'INVITE' && !email2Valid && email2.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
// 		const email3Class = (action === '') ? 'input-wrapper' : (action === 'INVITE' && !email3Valid && email3.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const titleClass = (action === '') ? 'input-wrapper' : (action === 'UPLOAD' && this.state.uploadTitle === '') ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		const nextButtonClass = (uploadComplete && this.state.uploadTitle.length > 0 && !this.state.submitted) ? 'narrow-button' : 'narrow-button button-disabled';
// 		const inviteButtonClass = (email1.length > 0 || email2.length > 0 || email3.length > 0) ? '' : 'button-disabled';

		let title = '';
		if (processingState === -1) {
			title = (uploading) ? ('Uploading ' + this.state.uploadTitle + '…') : (uploadComplete) ? 'Processing ' + this.state.uploadTitle : 'Drag & drop your Sketch file';

		} else if (processingState < 3) {
			title = 'Processing ' + this.state.uploadTitle;

		} else if (processingState === 3) {
			title = this.state.uploadTitle + ' has completed processing';
		}

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

		const artboards = this.state.artboards;

		return (
			<div className="page-wrapper upload-page-wrapper">
				{(processingState === -1) ? (<div>
					<Dropzone
						ref={dzWrapper}
						className="upload-page-dz-wrapper"
						onDrop={this.onDrop.bind(this)}
						onDragEnter={this.onDragEnter.bind(this)}
						onDragLeave={this.onDragLeave.bind(this)}>
						<div className="page-header upload-page-header-dz">
							<div className="upload-page-progress-wrapper">
								{(this.state.uploading) && (
									<div className="upload-page-progress" style={progressStyle}>
									</div>
								)}
							</div>
							{(!uploadComplete)
								? (<div>
										{(!uploading) && (<Row horizontal="center"><img className="upload-page-icon" src="/images/upload.png" alt="Upload" /></Row>)}
										{(!uploading) ? (<Row horizontal="center"><h1 className="sub-h1">{title}</h1></Row>) : (<Row horizontal="center"><h1>{title}</h1></Row>)}
										{(uploading) ? (<Row horizontal="center"><button onClick={(event)=> this.handleCancel(event)}>Cancel</button></Row>) : (<div className="page-header-subtext">Or choose your file</div>)}
									</div>)
								: (<div>
									<Row horizontal="center"><h1>{title}</h1></Row>
									<div className="page-header-text">{(this.state.status === '') ? 'Design Engine parsed 0 pages, artboards, symbols, fonts, and more from ' + this.state.uploadTitle + '\'s Design Source.' : this.state.status}</div>
									<Row horizontal="center">
										<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.uploadURL}>
											<button className="adjacent-button">Copy Project Link</button>
										</CopyToClipboard>
										<button onClick={() => this.props.onPage('invite-team')}>Invite Team Members</button>
									</Row>
								</div>)}
						</div>
					</Dropzone>

					<div style={{width:'100%'}}>
						<div className="upload-page-form-wrapper">
							<div className={titleClass}><input type="text" name="uploadTitle" placeholder="Project Title" value={this.state.uploadTitle} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} ref={titleTextfield} /></div>
							<div className="input-wrapper"><input type="text" name="description" placeholder="Project Description" value={this.state.description} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
							<Row horizontal="start" style={{flexWrap:'wrap'}}>
								{radioButtons}
							</Row>
							<button className={nextButtonClass} onClick={() => this.handleSubmit()}>Next</button>
						</div>
					</div>

				</div>) : (<div>
					<div className="page-header">
						<div className="upload-page-progress-wrapper">
							{(this.state.uploading) && (<div className="upload-page-progress" style={progressStyle} />)}
						</div>
						<Row horizontal="center"><h1>{title}</h1></Row>
						<div className="page-header-text">{(this.state.status === '') ? 'Design Engine parsed 0 pages, artboards, symbols, fonts, and more from ' + this.state.uploadTitle + '\'s Design Source.' : this.state.status}</div>
						<Row horizontal="center">
							<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={this.state.uploadURL}>
								<button className="adjacent-button">Copy Project Link</button>
							</CopyToClipboard>
							<button onClick={() => this.props.onPage('invite-team')}>Invite Team Members</button>
						</Row>
					</div>

					<div>
						<h4>Processing {this.state.uploadTitle}…</h4>
						<Row horizontal="space-between" className="home-page-artboards-wrapper" style={{flexWrap:'wrap'}}>
							{artboards.map((artboard) => {
								return (
									<Column key={artboard.id}>
										<ArtboardItem
											title={artboard.title}
											image={artboard.filename}
											size="landscape"//{(artboard.meta.frame.size.width > artboard.meta.frame.size.height || artboard.meta.frame.size.width === artboard.meta.frame.size.height) ? 'landscape' : 'portrait'}
											onClick={() => this.props.onArtboardClicked(artboard)} />
									</Column>
								);
							})}
						</Row>
					</div>
				</div>)}
				<BottomNav onPage={(url)=> this.props.onPage(url)} onLogout={()=> this.props.onLogout()} />

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default UploadPage;