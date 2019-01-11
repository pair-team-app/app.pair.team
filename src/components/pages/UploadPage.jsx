
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import cookie from "react-cookies";
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import RegisterForm from '../elements/RegisterForm';
import ArtboardItem from '../iterables/ArtboardItem';
import Dropdown from '../elements/Dropdown';
import RadioButton from '../elements/RadioButton';
import { addFileUpload, updateUserProfile } from '../../redux/actions';
import {
	buildInspectorPath,
	buildProjectURL,
	isUserLoggedIn,
	isValidEmail,
	sendToSlack
} from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';

import radioButtons from '../../json/radio-buttons_upload';
import uploadIcon from '../../images/icons/ico-upload.png';
import defaultAvatar from '../../images/default-avatar.png';

const titleTextfield = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		file    : state.file,
		profile : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload     : (file)=> dispatch(addFileUpload(file)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


function InviteForm(props) {
	const { invites } = props;

	invites.forEach((invite)=> {
		invite.txtClass = (invite.valid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
	});

	const inviteButtonClass = (invites.reduce((acc, val)=> acc + val.valid) > 0) ? 'fat-button' : 'fat-button button-disabled';

	return (<div className="upload-page-invite-wrapper">
		<h3>Invite Team</h3>
		Enter the email address of each member of your team to invite them to this project.
		<div className="upload-page-form-wrapper">
			<div style={{ width : '38%' }}><Column>
				{invites.map((invite, i)=> {
					const txtName = 'email' + (i + 1);
					const moreClass = (i <= 5) ? 'upload-page-more-link' : 'upload-page-more-link upload-page-more-link-hidden';
					return (
						<Row key={i} vertical="center"><div className={invite.txtClass}><input type="text" name={txtName} placeholder="Enter Email Address" value={invite.email} onFocus={props.onFocus} onChange={props.onInviteChange} /></div><span className={moreClass} onClick={()=> props.onMoreEmail()}>More</span></Row>
					);
				})}
			</Column></div>
			<button className={inviteButtonClass} onClick={() => (invites.reduce((acc, val)=> acc + val.valid) > 0) ? props.onInvite() : null}>Submit</button>
		</div>
	</div>);
}

function ProcessingContent(props) {
	const { upload, status, artboards } = props;

	return (<div>
		<div className="page-header">
			<div className="upload-page-progress-wrapper" />
			<Row horizontal="center"><h1>{upload.title}</h1></Row>
			<div className="page-header-text">{(status === '') ? 'Design Engine parsed 0 pages, artboards, symbols, fonts, and more from ' + upload.title + '\'s Design Source.' : status}</div>
			<Row horizontal="center">
				<button className="adjacent-button" onClick={() => this.props.onPage('invite-team')}>Invite Team</button>
				<CopyToClipboard onCopy={props.onCopy} text={buildProjectURL(upload.id, upload.title)}>
					<button>Copy Link</button>
				</CopyToClipboard>
			</Row>
		</div>

		<div>
			<h3>Processing…</h3>
			<Row horizontal="space-around" className="upload-page-artboards-wrapper" style={{ flexWrap : 'wrap' }}>
				{(artboards.length === 0) ? (
					<Column>
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

function UploadForm(props) {
	const { title, description, radioButtons, percent, uploadComplete, titleValid } = props;

	const titleClass = (titleValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
	const nextButtonClass = (uploadComplete && titleValid) ? 'fat-button' : 'fat-button button-disabled';

	return (<div>
		<div style={{ width : '100%' }}>
			<h3>Create a new design project</h3>
			<h4>A design project contains all the files for your project, including specifications, parts, and code
			    examples.</h4>
			<div className="upload-page-form-wrapper">
				<div style={{ width : '33%' }}>
					<Dropdown
						title="Select team (soon)"
						list={[]}
						resetThenSet={props.resetThenSet}
					/>
					<div className={titleClass}>
						<input type="text" name="title" placeholder="Project Name" value={title} onChange={props.onChange} ref={titleTextfield} />
					</div>
				</div>
				<div className="input-wrapper">
					<input type="text" name="description" placeholder="Project Description (optional)" value={description} onChange={props.onChange} />
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
				<button className={nextButtonClass} onClick={() => (uploadComplete && title.length > 0) ? props.onSubmit() : null}>{(percent > 0 && percent < 100) ? 'Uploading' : 'Submit'}</button>
			</div>
		</div>
	</div>);
}

function UploadHeader(props) {
	const { processingState, percent } = props;
	const progressStyle = { width : percent + '%' };

	return (<div>
		{(processingState === -2) && (
			<Dropzone className="upload-page-dz-wrapper" onDrop={props.onDrop}>
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
			<div className="upload-progress-bar-wrapper">
				{(percent > 0 && percent < 100) && (<div className="upload-progress-bar" style={progressStyle} />)}
			</div>
		</div>)}
	</div>);
}


class UploadPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			file            : null,
			upload          : null,
			title           : '',
			description     : '',
			percent         : 0,
			processingState : -2,
			status          : '',
			titleValid      : true,
			uploadComplete  : false,
			registering     : false,
			submitted       : false,
			sentInvites     : false,
			shownStarted    : false,
			profile   : {
				id    : 0,
				email : ''
			},
			invites         : [{
				email    : '',
				valid    : true,
				txtClass : 'input-wrapper'
			}],
			register        : {
				username      : '',
				email         : '',
				password      : '',
				password2     : '',
				usernameValid : true,
				emailValid    : true,
				passwordValid : true,
				passMsg       : ''
			},
			artboards       : [],
			radioButtons    : radioButtons,
			radioIndex      : 2
		};

		this.uploadInterval = null;
	}

	componentDidMount() {
		console.log('UploadPage.componentDidMount()', this.props, this.state);

		const { file } = this.props;
		if (file) {
			this.onDrop([file]);
		}
	}

	componentWillUnmount() {
		console.log('UploadPage.componentWillUnmount()');
		clearInterval(this.uploadInterval);
	}

	onDrop(files) {
		console.log('UploadPage.onDrop()', files);

		const { id, email } = (this.props.profile) ? this.props.profile : this.state;
		if (files.length > 0) {
			const file = files.pop();

			if (file.name.split('.').pop() === 'sketch') {
				if (file.size < 100 * (1024 * 1024)) {
					sendToSlack('*[' + id + ']* *' + email + '* started uploading file "_' + file.name + '_"');

					this.setState({
						processingState : -1,
						file            : file,
						title           : file.name.split('.').slice(0, -1).join('.'),
						action          : 'UPLOAD'
					});

					const config = {
						headers             : { 'content-type' : 'multipart/form-data' },
						onDownloadProgress  : (progressEvent)=> {
// 							console.log('HomeExpo.onDownloadProgress()', progressEvent);
						},
						onUploadProgress    : (progressEvent)=> {
// 							console.log('HomeExpo.onUploadProgress()', progressEvent);

							const { loaded, total } = progressEvent;
							const percent = Math.round((loaded * 100) / total);
							this.setState({ percent });

							if (progressEvent.loaded >= progressEvent.total) {
								this.onUploadComplete();
							}
						}
					};

					let formData = new FormData();
					formData.append('file', file);
					axios.post('http://cdn.designengine.ai/upload.php?dir=%2Fsystem', formData, config)
						.then((response) => {
							console.log("UPLOAD", response.data);
						}).catch((error) => {
						sendToSlack('*' + email + '* upload failed for file _' + file.name + '_');
					});

				} else {
					sendToSlack('*[' + id + ']* *' + email + '* uploaded oversized file (' + Math.round(file.size * (1 / (1024 * 1024))) + 'MB) "_' + file.name + '_"');
					this.props.onPopup({
						type     : 'ERROR',
						content  : 'File size must be under 100MB.',
						duration : 500
					});
				}

			} else {
				sendToSlack('*[' + id + ']* *' + email + '* uploaded incompatible file "_' + file.name + '_"');
				this.props.onPopup({
					type     : 'ERROR',
					content  : (file.name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'Only Sketch files are support at this time.',
					duration : 1500
				});
			}
		}
	}

	onUploadComplete = ()=> {
		const { id, email } = (this.props.profile) ? this.props.profile : this.state;
		const { file } = this.state;

		sendToSlack('*[' + id + ']* *' + email + '* - "_' + file.name + '_" uploaded');
		this.setState({ uploadComplete : true });
	};

	resetThenSet = (ind, key) => {
	};

	handleInviteChange = (event)=> {
		console.log('UploadPage.handleInviteChange()', event.target);
		let { invites } = this.state;
		invites.forEach((invite, i)=> {
			if (i === parseInt([event.target.name].substr(-1), 10)) {
				invite.email = event.target.value;
			}
		});

		this.setState({ invites });
	};

	handleUploadChange = (event)=> {
		console.log('UploadPage.handleUploadChange()', event.target);
		this.setState({ [event.target.name] : event.target.value });
	};

	handleFocus = (event)=> {
		console.log('UploadPage.handleFocus()', event.target);

		let { invites } = this.state;
		invites.forEach((invite, i)=> {
			if (i === parseInt(event.target.name.substr(-1), 10)) {
				invite.email = '';
			}
		});

		this.setState({
			action  : '',
			invites : invites
		});
	};

	handleCancel = (event)=> {
		console.log('UploadPage.handleCancel()', event.target);
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

	handleCopy = ()=> {
		this.props.onPopup({
			type     : 'INFO',
			content  : 'Project URL copied to clipboard!',
			duration : 1500
		});
	};

	handleMoreEmail = ()=> {
		let { invites } = this.state;
		invites.push({
			email    : '',
			valid    : true,
			txtClass : 'input-wrapper'
		});

		this.setState({ invites });
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

	handleSubmit = (userProfile)=> {
		console.log('UploadPage.handleSubmit()', userProfile, this.state);

		const profile = (!this.props.profile) ? userProfile : this.state.profile;
		const { title, description, radioIndex, file, uploadComplete, registering, submitted } = this.state;
		const { name, size } = file;
		const titleValid = (title.length > 0);

		if (titleValid && uploadComplete && (!submitted || registering)) {
			this.setState({
				titleValid : titleValid,
				submitted  : true
			});

			if (isUserLoggedIn()) {
				let formData = new FormData();
				formData.append('action', 'NEW_UPLOAD');
				formData.append('user_id', profile.id);
				formData.append('title', title);
				formData.append('description', description);
				formData.append('filesize', size);
				formData.append('private', (radioIndex === 1) ? '0' : '1');
				formData.append('filename', "http://cdn.designengine.ai/system/" + name);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response) => {
						console.log('NEW_UPLOAD', response.data);
						this.setState({
							upload          : response.data.upload,
							processingState : 0,
							file            : null,
							registering     : false
						});

						this.props.addFileUpload(null);
						this.props.onProcess(true);
						this.uploadInterval = setInterval(this.statusInterval, 2500);
					}).catch((error) => {
				});

			} else {
				this.setState({ registering : true });
			}
		}
	};

	handleInvite = ()=> {
		const { upload, invites } = this.state;

		let emails = '';
		this.setState({
			action  : 'INVITE',
			invites : invites.forEach((invite)=> {
				invite.valid = isValidEmail(invite.email);
				if (!invite.valid && invite.email.length > 0) {
					invite.email = 'Invalid Email Address';

				} else {
					emails += invite.email + ' ';
				}
			})
		});

		const isValid = invites.reduce((acc, val)=> acc + val.valid);
		console.log('REDUCER:', isValid);

		if (isValid > 0) {
			const { profile } = this.props;
			let formData = new FormData();
			formData.append('action', 'INVITE');
			formData.append('user_id', profile.id);
			formData.append('upload_id', '' + upload.id);
			formData.append('emails', emails.slice(0, -1));
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('INVITE', response.data);
				}).catch((error) => {
			});

			this.setState({ sentInvites : true });
		}
	};

	handleRegistered = (profile)=> {
		console.log('UploadPage.handleRegistered()', profile);

		trackEvent('user', 'sign-up');
		cookie.save('user_id', profile.id, { path : '/' });



		setTimeout(()=> {
			this.props.updateUserProfile(profile);
			this.handleSubmit(profile);
		}, 750);
	};

	statusInterval = ()=> {
		const { upload, shownStarted } = this.state;

		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', upload.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_STATUS', response.data);
				const processingState = parseInt(response.data.status.state, 10);

				if (processingState === 1) {
					this.props.onProcess(false);

					if (!shownStarted) {
						this.setState({ shownStarted : true });
						this.props.onPopup({
							type     : 'INFO',
							content  : 'Processing has started'
						});
					}

				} else if (processingState === 2) {
					let status = response.data.status.message;

					formData.append('action', 'ARTBOARDS');
					formData.append('upload_id', upload.id);
					formData.append('slices', '0');
					formData.append('page_id', '0');
					formData.append('offset', '0');
					formData.append('length', '-1');
					axios.post('https://api.designengine.ai/system.php', formData)
						.then((response)=> {
							console.log('ARTBOARDS', response.data);

							let { artboards } = this.state;
							if (response.data.artboards.length !== artboards.length) {
								artboards = response.data.artboards.map((artboard) => ({
									id       : artboard.id,
									pageID   : artboard.page_id,
									system   : artboard.system,
									title    : artboard.title,
									type     : artboard.type,
									filename : artboard.filename,
									meta     : JSON.parse(artboard.meta),
									added    : artboard.added,
									selected : false
								}));
							}

							this.setState({ status, processingState, artboards });
						}).catch((error) => {
					});

				} else if (processingState === 3) {
					clearInterval(this.uploadInterval);
// 					this.props.onPage(buildProjectPath(upload.id, upload.title, '/views'));

					formData.append('action', 'PAGES');
					formData.append('upload_id', upload.id);
					formData.append('offset', '0');
					formData.append('length', '1');
					axios.post('https://api.designengine.ai/system.php', formData)
						.then((response) => {
							console.log('PAGES', response.data);
							const page = response.data.pages.shift();
							const artboard = page.artboards.shift();

							this.props.onPage(buildInspectorPath(upload.id, page.id, artboard.id, artboard.title));
						}).catch((error) => {
					});

				} else if (processingState === 4) {
					// processing error
				}
			}).catch((error) => {
		});
	};


	render() {
		console.log('UploadPage.render()', this.props, this.state);

		const { upload, title, description, radioButtons, status, artboards, invites } = this.state;
		const { processingState, percent, uploadComplete, submitted, sentInvites, titleValid } = this.state;

		return (
			<div className="page-wrapper upload-page-wrapper">
				{(processingState < 0) && (<UploadHeader
					processingState={processingState}
					percent={percent}
					onDrop={this.onDrop.bind(this)}
				/>)}

				{(processingState < 0 && !submitted) && (<div className="upload-page-upload-wrapper">
					<UploadForm
						processingState={processingState}
						title={title}
						description={description}
						radioButtons={radioButtons}
						titleValid={titleValid}
						percent={percent}
						uploadComplete={uploadComplete}
						onChange={this.handleUploadChange}
						onFocus={this.handleFocus}
						onRadioButton={this.handleRadioButton}
						onSubmit={this.handleSubmit}
					/>
				</div>)}

				{(!isUserLoggedIn() && submitted) && (<div className="upload-page-register-wrapper">
					<h3>Sign Up</h3>
					Enter registration details to submit design file.
					<RegisterForm
						onPage={this.props.onPage}
						onRegistered={this.handleRegistered} />
				</div>)}

				{(processingState >= 0) && (<div>
					<ProcessingContent
						title={title}
						upload={upload}
						status={status}
						artboards={artboards}
						onCopy={this.handleCopy}
					/>

					{(!sentInvites) && (<InviteForm
						invites={invites}
						onInviteChange={this.handleInviteChange}
						onFocus={this.handleFocus}
						onMoreEmail={this.handleMoreEmail}
						onInvite={this.handleInvite}
					/>)}
				</div>)}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPage);