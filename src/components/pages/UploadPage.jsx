
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import RegisterForm from '../elements/RegisterForm';
import ArtboardItem from '../iterables/ArtboardItem';
import Dropdown from '../elements/Dropdown';
import RadioButton from '../elements/RadioButton';
import {buildProjectPath, buildProjectURL, isUserLoggedIn, isValidEmail} from '../../utils/funcs';
import uploadIcon from '../../images/upload.png';
import defaultAvatar from '../../images/default-avatar.png';
import { updateUserProfile } from '../../redux/actions';
import {trackEvent} from "../../utils/tracking";
import cookie from "react-cookies";


const dzWrapper = React.createRef();
const titleTextfield = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
};

function mapDispatchToProps(dispatch) {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
}


function InviteForm(props) {
	const { action, invites } = props;

	invites.forEach((invite)=> {
		invite.txtClass = (action === 'INVITE' && !invite.valid && invite.email.length > 0) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
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
						<Row key={i} vertical="center"><div className={invite.txtClass}><input type="text" name={txtName} placeholder="Enter Email Address" value={invite.email} onFocus={(event)=> props.onFocus(event)} onChange={(event)=> props.onInviteChange(event)} /></div><span className={moreClass} onClick={()=> props.onMoreEmail()}>More</span></Row>
					);
				})};
			</Column></div>
			<button className={inviteButtonClass} onClick={() => (invites.reduce((acc, val)=> acc + val.valid) > 0) ? props.onInvite() : null}>Submit</button>
		</div>
	</div>);
}

function ProcessingGrid(props) {
	const { upload, status, artboards } = props;

	return (<div>
		<div className="page-header">
			<div className="upload-page-progress-wrapper" />
			<Row horizontal="center"><h1>{upload.title}</h1></Row>
			<div className="page-header-text">{(status === '') ? 'Design Engine parsed 0 pages, artboards, symbols, fonts, and more from ' + upload.title + '\'s Design Source.' : status}</div>
			<Row horizontal="center">
				<button className="adjacent-button" onClick={() => this.props.onPage('invite-team')}>Invite Team</button>
				<CopyToClipboard onCopy={()=> this.handleURLCopy()} text={buildProjectURL(upload.id, upload.title)}>
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

function UploadForm(props) {
	const { action, processingState, title, description, radioButtons, percent, uploading, uploadComplete } = props;

	const titleClass = (action === 'UPLOAD' && title === '') ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
	const nextButtonClass = (uploadComplete && title.length > 0) ? 'fat-button' : 'fat-button button-disabled';

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
						<input type="text" name="title" placeholder="Project Name" value={title} onChange={(event)=> props.onChange(event)} ref={titleTextfield} />
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
				<button className={nextButtonClass} onClick={() => (uploadComplete && title.length > 0) ? props.onSubmit() : null}>{(uploading) ? 'Uploading' : 'Submit'}</button>
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
			upload          : null,
			title           : '',
			description     : '',
			processingState : -2,
			status          : '',
			action          : '',
			uploading       : false,
			uploadComplete  : false,
			submitted       : false,
			sentInvites     : false,
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
			radioIndex : 1
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
					title     : files[0].name.split('.').slice(0, -1).join('.'),
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
				this.props.onPopUp({
					type     : 'ERROR',
					content  : 'File size must be under 100MB.',
					duration : 500
				});
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

			this.props.onPopUp({
				type     : 'ERROR',
				content  : (files[0].name.split('.').pop() === 'xd') ? 'Adobe XD Support Coming Soon!' : 'error::Only Sketch files are support at this time.',
				duration : 1500
			});
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
			if (i === parseInt([event.target.name].substr(-1), 10)) {
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

	handleURLCopy = ()=> {
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

	handleSubmit = ()=> {
		const { title, description, radioIndex, uploadComplete, submitted } = this.state;
		const { name, size } = this.state.files[0];

		if (uploadComplete && !submitted) {
			this.setState({ submitted : true });
			let formData = new FormData();
			formData.append('action', 'NEW_UPLOAD');
			formData.append('user_id', this.props.profile.id);
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
						files           : []
					});

					this.props.onProcess(true);
					this.uploadInterval = setInterval(this.statusInterval, 2500);
				}).catch((error) => {
			});
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
			let formData = new FormData();
			formData.append('action', 'INVITE');
			formData.append('user_id', this.props.profile.id);
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

		trackEvent('user', 'sign-up', profile.username + ' (' + profile.email + ')', parseInt(profile.id, 10));
		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);
	};

	statusInterval = ()=> {
		const { upload } = this.state;

		let formData = new FormData();
		formData.append('action', 'UPLOAD_STATUS');
		formData.append('upload_id', '' + upload.id);
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response) => {
				console.log('UPLOAD_STATUS', response.data);
				const processingState = parseInt(response.data.status.state, 10);

				if (processingState === 1) {
					this.props.onProcess(false);

				} else if (processingState === 2) {
					let status = response.data.status.message;

					formData.append('action', 'ARTBOARDS');
					formData.append('upload_id', '' + upload.id);
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
					this.props.onPage(buildProjectPath(upload.id, upload.title, '/views'));

				} else if (processingState === 4) {
					// processing error
				}
			}).catch((error) => {
		});
	};


	render() {
		console.log('UploadPage.render()', this.props, this.state);

		const { action } = this.state;
		const { upload, title, description, radioButtons, status, artboards, invites } = this.state;
		const { processingState, percent, uploading, uploadComplete, sentInvites } = this.state;

		return (
			<div className="page-wrapper upload-page-wrapper">
				{(processingState < 0) && (<div>
					<UploadForm
						action={action}
						processingState={processingState}
						title={title}
						description={description}
						radioButtons={radioButtons}
						percent={percent}
						uploading={uploading}
						uploadComplete={uploadComplete}
						onDrop={this.onDrop.bind(this)}
						onDragEnter={this.onDragEnter.bind(this)}
						onDragLeave={this.onDragLeave.bind(this)}
						onChange={this.handleUploadChange}
						onFocus={(event)=> this.handleFocus(event)}
						onRadioButton={(radioButton)=> this.handleRadioButton(radioButton)}
						onSubmit={()=> this.handleSubmit()}
					/>

					{(!isUserLoggedIn()) && (<div className="upload-page-register-wrapper">
						<h3>Sign Up</h3>
						Enter the email address of each member of your team to invite them to this project.
						<RegisterForm
							onPage={(url)=> this.props.onPage(url)}
							onRegistered={(profile)=> this.handleRegistered(profile)} />
					</div>)}
				</div>)}

				{(processingState >= 0) && (<div>
					<ProcessingGrid
						title={title}
						upload={upload}
						status={status}
						artboards={artboards}
					/>

					{(!sentInvites) && (<InviteForm
						action={action}
						invites={invites}
						onInviteChange={this.handleInviteChange}
						onFocus={(event)=> this.handleFocus(event)}
						onMoreEmail={this.handleMoreEmail}
						onInvite={this.handleInvite}
					/>)}
				</div>)}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPage);