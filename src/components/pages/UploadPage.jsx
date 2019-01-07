
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import ArtboardItem from '../iterables/ArtboardItem';
import Dropdown from '../elements/Dropdown';
import Popup from '../elements/Popup';
import RadioButton from '../elements/RadioButton';
import {buildProjectPath, buildProjectURL, isValidEmail} from '../../utils/funcs';
import uploadIcon from '../../images/upload.png';
import defaultAvatar from '../../images/default-avatar.png';


const dzWrapper = React.createRef();
const titleTextfield = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};


function InviteForm(props) {
	const { action, emailCounter, validEmail, email1, email2, email3, email4, email5 } = props;

	const email1Class = (action === 'INVITE' && !validEmail[0] && email1.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
	const email2Class = (action === 'INVITE' && !validEmail[1] && email2.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
	const email3Class = (action === 'INVITE' && !validEmail[2] && email3.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
	const email4Class = (action === 'INVITE' && !validEmail[3] && email4.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
	const email5Class = (action === 'INVITE' && !validEmail[4] && email5.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

	const inviteButtonClass = (email1.length > 0 || email2.length > 0 || email3.length > 0) ? 'fat-button' : 'fat-button button-disabled';

	return (<div className="upload-page-invite-wrapper">
		<h3>Invite Team</h3>
		Enter the email address of each member of your team to invite them to this project.
		<div className="upload-page-form-wrapper">
			<div style={{ width : '38%' }}><Column>
				{(emailCounter >= 1) && (<Row vertical="center"><div className={email1Class}><input type="text" name="email1" placeholder="Enter Email Address" value={email1} onFocus={(event)=> props.onFocus(event)} onChange={(event)=> props.onChange(event)} /></div><span className="upload-page-more-link" onClick={()=> props.onMoreEmail()}>More</span></Row>)}
				{(emailCounter >= 2) && (<Row vertical="center"><div className={email2Class}><input type="text" name="email2" placeholder="Enter Email Address" value={email2} onFocus={(event)=> props.onFocus(event)} onChange={(event)=> props.onChange(event)} /></div><span className="upload-page-more-link" onClick={()=> props.onMoreEmail()}>More</span></Row>)}
				{(emailCounter >= 3) && (<Row vertical="center"><div className={email3Class}><input type="text" name="email3" placeholder="Enter Email Address" value={email3} onFocus={(event)=> props.onFocus(event)} onChange={(event)=> props.onChange(event)} /></div><span className="upload-page-more-link" onClick={()=> props.onMoreEmail()}>More</span></Row>)}
				{(emailCounter >= 4) && (<Row vertical="center"><div className={email4Class}><input type="text" name="email4" placeholder="Enter Email Address" value={email4} onFocus={(event)=> props.onFocus(event)} onChange={(event)=> props.onChange(event)} /></div><span className="upload-page-more-link" onClick={()=> props.onMoreEmail()}>More</span></Row>)}
				{(emailCounter === 5) && (<Row vertical="center"><div className={email5Class}><input type="text" name="email5" placeholder="Enter Email Address" value={email5} onFocus={(event)=> props.onFocus(event)} onChange={(event)=> props.onChange(event)} /></div><span className="upload-page-more-link upload-page-more-link-hidden">More</span></Row>)}
			</Column></div>
			<button className={inviteButtonClass} onClick={() => (email1.length > 0 || email2.length > 0 || email3.length > 0) ? props.onInvite() : null}>Submit</button>
		</div>
	</div>);
}

function ProcessingStatus(props) {
	const { uploadTitle, uploadURL, status, artboards } = props;

	return (<div>
		<div className="page-header">
			<div className="upload-page-progress-wrapper" />
			<Row horizontal="center"><h1>{uploadTitle}</h1></Row>
			<div className="page-header-text">{(status === '') ? 'Design Engine parsed 0 pages, artboards, symbols, fonts, and more from ' + uploadTitle + '\'s Design Source.' : status}</div>
			<Row horizontal="center">
				<button className="adjacent-button" onClick={() => this.props.onPage('invite-team')}>Invite Team</button>
				<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={uploadURL}>
					<button>Copy Link</button>
				</CopyToClipboard>
			</Row>
		</div>

		<div>
			<h3>Processing…</h3>
			<Row horizontal="space-between" className="upload-page-artboards-wrapper" style={{ flexWrap : 'wrap' }}>
				{(artboards.length === 0) ? (
					<Column key="0">
						<ArtboardItem
							title=""
							image=""
							avatar={defaultAvatar}
							size="landscape" />
					</Column>
				) : (artboards.map((artboard) => {
					return (
						<Column key={artboard.id}>
							<ArtboardItem
								title={artboard.title}
								image={artboard.filename}
								avatar={artboard.system.avatar}
								size="landscape"
								onClick={() => this.props.onArtboardClicked(artboard)} />
						</Column>
					);
				}))}
			</Row>
		</div>
	</div>);
}

function UploadHeader(props) {
	const { action, processingState, uploadTitle, description, radioButtons, percent, uploading, uploadComplete } = props;

	const titleClass = (action === 'UPLOAD' && uploadTitle === '') ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
	const nextButtonClass = (uploadComplete && uploadTitle.length > 0) ? 'fat-button' : 'fat-button button-disabled';

	const progressStyle = { width : percent + '%' };

	return (<div>
		{(processingState === -2) && (
			<Dropzone
				ref={dzWrapper}
				className="upload-page-dz-wrapper"
				onDrop={props.onDrop}
				onDragEnter={props.onDragEnter}
				onDragLeave={props.onDragLeave}>
				<div className="page-header upload-page-header-dz">
					<div>
						<Row horizontal="center"><img className="upload-page-icon" src={uploadIcon} alt="Upload" /></Row>
						<Row horizontal="center"><h1 className="sub-h1">Drag &amp; drop your design</h1></Row>
						<div className="page-header-subtext">Or choose your file</div>
					</div>
				</div>
			</Dropzone>
		)}

		{(processingState === -1) && (<div>
			<div className="upload-page-progress-wrapper">
				{(uploading) && (<div className="upload-page-progress" style={progressStyle} />)}
			</div>
		</div>)}

		<div style={{ width : '100%' }}>
			<h3>Create a new design project</h3>
			<h4>A design project contains all the files for your project, including specifications, parts, and code
			    examples.</h4>
			<div className="upload-page-form-wrapper">
				<div style={{ width : '33%' }}>
					<Dropdown
						title="Select team (soon)"
						list={[]}
						resetThenSet={()=> props.resetThenSet()}
					/>
					<div className={titleClass}>
						<input type="text" name="uploadTitle" placeholder="Project Name" value={uploadTitle} onChange={(event)=> props.onChange(event)} ref={titleTextfield} />
					</div>
				</div>
				<div className="input-wrapper">
					<input type="text" name="description" placeholder="Project Description (optional)" value={description} onChange={(event)=> props.onChange(event)} />
				</div>
				<div className="upload-page-radio-wrapper">
					{radioButtons.map((radioButton, i)=> {
						return (
							<Column key={i}>
								<RadioButton
									key={i}
									enabled={radioButton.enabled}
									selected={radioButton.selected}
									title={radioButton.title}
									subtext={radioButton.subtext}
									onClick={()=> props.onRadioButton(radioButton)}
								/>
							</Column>
						);
					})}
				</div>
				<button className={nextButtonClass} onClick={() => (uploadComplete && uploadTitle.length > 0) ? props.onSubmit() : null}>{(uploading) ? 'Uploading' : 'Submit'}</button>
			</div>
		</div>
	</div>);
}


class UploadPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			files           : [],
			percent         : 0,
			uploadID        : 0,
			uploadTitle     : '',
			description     : '',
			uploadURL       : '',
			processingState : -2,
			status          : '',
			uploading       : false,
			uploadComplete  : false,
			submitted       : false,
			sentInvites     : false,
			action          : '',
			email1          : '',
			email2          : '',
			email3          : '',
			email4          : '',
			email5          : '',
			email1Valid     : false,
			email2Valid     : false,
			email3Valid     : false,
			email4Valid     : false,
			email5Valid     : false,
			emailCounter    : 1,
			artboards       : [],
			radioButtons    : [{
				id       : 1,
				title    : 'Public',
				subtext  : 'Anyone can see, download, & clone this design project.',
				selected : true,
				enabled  : true
			}, {
				id       : 2,
				title    : 'Private',
				subtext  : 'You choose who can see, download, & clone this design project.',
				selected : false,
				enabled  : true
			}],
			radioIndex : 1,
			popup : {
				visible : false,
				content : ''
			}
		};

		this.uploadInterval = null;
	}

	componentWillUnmount() {
		clearInterval(this.uploadInterval);
	}

	onDragEnter() {}
	onDragLeave() {}

	onDrop(files) {
		console.log('UploadPage.onDrop()', files);

		const { id, email } = this.props.profile;
		if (files.length > 0 && files[0].name.split('.').pop() === 'sketch') {
			if (files[0].size < 100 * 1024 * 1024) {

				let formData = new FormData();
				formData.append('action', 'SLACK');
				formData.append('message', '*[' + id + ']* *' + email + '* started uploading file "_' + files[0].name + '_"');
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log("SLACK", response.data);
					}).catch((error) => {
				});


				this.setState({
					processingState : -1,
					files           : files,
					uploadTitle     : files[0].name.split('.').slice(0, -1).join('.'),
					uploading       : true,
					action          : 'UPLOAD'
				});

				let self = this;
				const config = {
					headers : {
						'content-type' : 'multipart/form-data'
					}, onUploadProgress : function (progressEvent) {
						const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						self.setState({ percent });

						if (progressEvent.loaded === progressEvent.total) {
							let formData = new FormData();
							formData.append('action', 'SLACK');
							formData.append('message', '*[' + id + ']* *' + email + '* - "_' + files[0].name + '_" uploaded');
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
						formData.append('message', '*' + email + '* upload failed for file _' + files[0].name + '_');
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
				this.setState({ popup });
			}

		} else {
			let formData = new FormData();
			formData.append('action', 'SLACK');
			formData.append('message', '*[' + id + ']* *' + email + '* uploaded incompatible file "_' + files[0].name + '_"');
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log("SLACK", response.data);
				}).catch((error) => {
			});

			const popup = {
				visible : true,
				content : (files[0].name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'error::Only Sketch files are support at this time.'
			};
			this.setState({ popup });
		}
	}

	onUploadComplete = ()=> {
		this.setState({
			uploading      : false,
			uploadComplete : true
		});
	};

	resetThenSet = (ind, key) => {
	};

	handleChange = (event)=> {
		console.log('UploadPage.handleChange()', event);
		this.setState({ [event.target.name] : event.target.value });
	};

	handleFocus = (event)=> {
		console.log('UploadPage.handleFocus()', event);
		this.setState({ action : '', [event.target.name] : '' });
	};

	handleCancel = (event)=> {
		console.log('UploadPage.handleCancel()', event);
		event.preventDefault();
		event.stopPropagation();

		let formData = new FormData();
		formData.append('action', 'UPLOAD_CANCEL');
		formData.append('upload_id', '' + this.state.uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_CANCEL', response.data);
				clearInterval(this.uploadInterval);
				this.props.onProcess(false);
				this.props.onPage('<<');
			}).catch((error) => {
		});
	};

	handleURLCopy = ()=> {
		const popup = {
			visible : true,
			content : 'Project URL copied to clipboard!'
		};
		this.setState({ popup });
	};

	handleMoreEmail = ()=> {
		const { emailCounter } = this.state;
		this.setState({ emailCounter : Math.min(emailCounter + 1, 5) });
	};

	handleRadioButton = (radioButton)=> {
		let radioButtons = [...this.state.radioButtons];
		radioButtons.forEach((item)=> {
			item.selected = (item.id === radioButton.id);
		});

		this.setState({
			radioButtons : radioButtons,
			radioIndex   : radioButton.id
		});
	};

	handleSubmit = ()=> {
		const { uploadTitle, description, radioIndex, files, uploadComplete, submitted } = this.state;

		if (uploadComplete && !submitted) {
			this.setState({ submitted : true });
			let formData = new FormData();
			formData.append('action', 'NEW_UPLOAD');
			formData.append('user_id', this.props.profile.id);
			formData.append('title', uploadTitle);
			formData.append('description', description);
			formData.append('filesize', files[0].size);
			formData.append('private', (radioIndex === 1) ? '0' : '1');
			formData.append('filename', "http://cdn.designengine.ai/system/" + files[0].name);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('NEW_UPLOAD', response.data);
					const url = buildProjectURL(response.data.upload_id, uploadTitle) + '/views';

					this.setState({
						uploadID        : response.data.upload_id,
						uploadURL       : url,
						processingState : 0,
						files           : [],
// 						popup           : {
// 							visible : true,
// 							content : 'Project URL copied to clipboard!'
// 						}
					});

					this.props.onProcess(true);
					this.uploadInterval = setInterval(this.statusInterval, 2500);
				}).catch((error) => {
			});
		}
	};

	handleInvite = ()=> {
		const { uploadID, email1, email2, email3, email4, email5 } = this.state;

		const isEmail1Valid = isValidEmail(email1);
		const isEmail2Valid = isValidEmail(email2);
		const isEmail3Valid = isValidEmail(email3);
		const isEmail4Valid = isValidEmail(email4);
		const isEmail5Valid = isValidEmail(email5);

		this.setState({
			action      : 'INVITE',
			email1Valid : isEmail1Valid,
			email2Valid : isEmail2Valid,
			email3Valid : isEmail3Valid,
			email4Valid : isEmail4Valid,
			email5Valid : isEmail5Valid
		});

		if (!isEmail1Valid && email1.length > 0) {
			this.setState({ email1 : 'Invalid Email Address' });
		}

		if (!isEmail2Valid && email2.length > 0) {
			this.setState({ email2 : 'Invalid Email Address' });
		}

		if (!isEmail3Valid && email3.length > 0) {
			this.setState({ email3 : 'Invalid Email Address' });
		}

		if (!isEmail4Valid && email4.length > 0) {
			this.setState({ email4 : 'Invalid Email Address' });
		}

		if (!isEmail5Valid && email5.length > 0) {
			this.setState({ email5 : 'Invalid Email Address' });
		}

		let emails = '';
		if (isEmail1Valid) {
			emails += email1 + ' ';
		}

		if (isEmail2Valid) {
			emails += email2 + ' ';
		}

		if (isEmail3Valid) {
			emails += email3 + ' ';
		}

		if (isEmail4Valid) {
			emails += email4 + ' ';
		}

		if (isEmail5Valid) {
			emails += email5;
		}

		if (isEmail1Valid || isEmail2Valid || isEmail3Valid || isEmail4Valid || isEmail5Valid) {
			let formData = new FormData();
			formData.append('action', 'INVITE');
			formData.append('user_id', this.props.profile.id);
			formData.append('upload_id', '' + uploadID);
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
		const { uploadID, uploadTitle } = this.state;
		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', '' + uploadID);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_STATUS', response.data);
				const processingState = parseInt(response.data.status.state, 10);

				console.log('::::::::::-- processingState --:::::::::::::::::', processingState);
				if (processingState === 1) {
					this.props.onProcess(false);

				} else if (processingState === 2) {
					let status = response.data.status.message;

					formData.append('action', 'ARTBOARDS');
					formData.append('upload_id', '' + uploadID);
					formData.append('slices', '0');
					formData.append('page_id', '0');
					formData.append('offset', '0');
					formData.append('length', '-1');
					axios.post('https://api.designengine.ai/system.php', formData)
						.then((response)=> {
							console.log('ARTBOARDS', response.data);

							let { artboards } = this.state;
							if (response.data.artboards.length !== this.state.artboards.length) {
								artboards = response.data.artboards.map((item) => ({
									id       : item.id,
									pageID   : item.page_id,
									title    : item.title,
									type     : item.type,
									filename : item.filename,
									meta     : JSON.parse(item.meta),
									added    : item.added,
									selected : false
								}));
							}

							this.setState({ status, processingState, artboards });
						}).catch((error) => {
					});

				} else if (processingState === 3) {
					clearInterval(this.uploadInterval);
					this.props.onPage(buildProjectPath(uploadID, uploadTitle) + '/views');
// 					window.location.href = buildProjectURL(uploadID, uploadTitle) + '/views';
				}
			}).catch((error) => {
		});
	};


	render() {
		console.log('UploadPage.render()', this.props, this.state);

		const { action } = this.state;
		const { emailCounter, email1, email2, email3, email4, email5, email1Valid, email2Valid, email3Valid, email4Valid, email5Valid } = this.state;
		const { uploadTitle, uploadURL, description, radioButtons, status, artboards } = this.state;
		const { processingState, percent, uploading, uploadComplete, sentInvites } = this.state;

		return (
			<div className="page-wrapper upload-page-wrapper">
				{(processingState < 0) && (
					<UploadHeader
						action={action}
						processingState={processingState}
						uploadTitle={uploadTitle}
						description={description}
						radioButtons={radioButtons}
						percent={percent}
						uploading={uploading}
						uploadComplete={uploadComplete}
						onDrop={this.onDrop.bind(this)}
						onDragEnter={this.onDragEnter.bind(this)}
						onDragLeave={this.onDragLeave.bind(this)}
						onChange={this.handleChange}
						onFocus={(event)=> this.handleFocus(event)}
						onRadioButton={(radioButton)=> this.handleRadioButton(radioButton)}
						onSubmit={()=> this.handleSubmit()}
					/>
				)}

				{(processingState >= 0) && (<div>
					<ProcessingStatus
						uploadTitle={uploadTitle}
						uploadURL={uploadURL}
						status={status}
						artboards={artboards}
					/>

					{(!sentInvites) && (<InviteForm
						action={action}
						emailCounter={emailCounter}
						validEmail={[email1Valid, email2Valid, email3Valid, email4Valid, email5Valid]}
						email1={email1}
						email2={email2}
						email3={email3}
						email4={email4}
						email5={email5}
						onChange={this.handleChange}
						onFocus={(event)=> this.handleFocus(event)}
						onMoreEmail={this.handleMoreEmail}
						onInvite={this.handleInvite}
					/>)}
				</div>)}

				{this.state.popup.visible && (
					<Popup content={this.state.popup.content} onComplete={()=> this.setState({ popup : { visible : false, content : '' }})} />
				)}
			</div>
		);
	}
}

export default connect(mapStateToProps)(UploadPage);