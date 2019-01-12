
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import LoginForm from '../elements/LoginForm';
import RegisterForm from '../elements/RegisterForm';
import RadioButton from '../elements/RadioButton';

import { addFileUpload, updateNavigation, updateUserProfile } from '../../redux/actions';
import { buildInspectorPath, isUserLoggedIn, isValidEmail, sendToSlack } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';
import radioButtons from '../../json/radio-buttons_upload';
import uploadIcon from '../../images/icons/ico-upload.png';

const titleTextfield = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		file       : state.file,
		navigation : state.navigation,
		profile    : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload     : (file)=> dispatch(addFileUpload(file)),
		updateNavigation  : (navIDs)=> dispatch(updateNavigation(navIDs)),
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
			<button className={inviteButtonClass} onClick={() => (invites.reduce((acc, val)=> acc + val.valid) > 0) ? props.onSubmit() : null}>Submit</button>
		</div>
	</div>);
}

function UploadForm(props) {
	const { title, description, radioButtons, percent, uploadComplete, titleValid } = props;

	const titleClass = (titleValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
	const nextButtonClass = (uploadComplete && titleValid) ? 'fat-button' : 'fat-button button-disabled';

	return (<div>
		<div style={{ width : '100%' }}>
			<h3>Upload</h3>
			<h4>Upload a design file to process.</h4>
			<div className="upload-page-form-wrapper">
				<div style={{ width : '33%' }}>
					<div className={titleClass}>
						<input type="text" name="title" placeholder="File name" value={title} onChange={props.onChange} ref={titleTextfield} />
					</div>
				</div>
				<div className="input-wrapper">
					<input type="text" name="description" placeholder="File description (optional)" value={description} onChange={props.onChange} />
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
	const { formState, percent } = props;
	const progressStyle = { width : percent + '%' };

	return (<div>
		{(formState === -2) && (
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

		{(formState === -1) && (<div>
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
			file           : null,
			title          : '',
			description    : '',
			percent        : 0,
			formState      : -2,
			titleValid     : true,
			login          : false,
			uploadComplete : false,
			registering    : false,
			submitted      : false,
			sentInvites    : false,
			shownStarted   : false,
			invites        : [{
				email    : '',
				valid    : true,
				txtClass : 'input-wrapper'
			}],
			radioButtons   : radioButtons,
			radioIndex     : 2
		};
	}

	componentDidMount() {
		console.log('UploadPage.componentDidMount()', this.props, this.state);

		const { file } = this.props;
		if (file) {
			this.onDrop([file]);
		}
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
						formState : -1,
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

	handleUploadChange = (event)=> {
		console.log('UploadPage.handleUploadChange()', event.target);
		this.setState({ [event.target.name] : event.target.value });
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
				this.props.onProcessing(false);
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

	handleInviteFocus = (event)=> {
		console.log('UploadPage.handleInviteFocus()', event.target);

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

	handleInviteSubmit = ()=> {
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

	handleLoggedIn = (profile)=> {
		console.log('UploadPage.handleLoggedIn()', profile);

		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);
		this.handleUploadSubmit(profile);
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

	handleRegistered = (profile)=> {
		console.log('UploadPage.handleRegistered()', profile);

		trackEvent('user', 'sign-up');
		cookie.save('user_id', profile.id, { path : '/' });

		this.props.updateUserProfile(profile);
		this.handleUploadSubmit(profile);
	};

	handleUploadSubmit = (userProfile)=> {
		console.log('UploadPage.handleUploadSubmit()', userProfile, this.props);

		const profile = (userProfile) ? userProfile : this.props.profile;
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
						const { upload } = response.data;

						this.props.updateNavigation({
							uploadID   : upload.id,
							pageID     : this.props.navigation.pageID,
							artboardID : this.props.navigation.artboardID
						});

						this.props.addFileUpload(null);
						this.props.onProcessing(true);
						this.props.onPage(buildInspectorPath(upload.id, upload.title));
					}).catch((error) => {
				});

			} else {
				this.setState({ registering : true });
			}
		}
	};


	render() {
		console.log('UploadPage.render()', this.props, this.state);

		const { title, description, radioButtons, invites } = this.state;
		const { formState, percent, uploadComplete, submitted, login, sentInvites, titleValid } = this.state;

		return (
			<div className="page-wrapper upload-page-wrapper">
				{(formState < 0) && (<UploadHeader
					formState={formState}
					percent={percent}
					onDrop={this.onDrop.bind(this)}
				/>)}

				{(formState < 0 && !submitted) && (<div className="upload-page-upload-wrapper">
					<UploadForm
						formState={formState}
						title={title}
						description={description}
						radioButtons={radioButtons}
						titleValid={titleValid}
						percent={percent}
						uploadComplete={uploadComplete}
						onChange={this.handleUploadChange}
						onRadioButton={this.handleRadioButton}
						onSubmit={this.handleUploadSubmit}
					/>
				</div>)}

				{(!isUserLoggedIn() && submitted && !login) && (<div className="upload-page-register-wrapper">
					<h3>Sign Up</h3>
					<h4>Enter registration details to submit design file.</h4>
					<RegisterForm
						onLogin={()=> this.setState({ login : true })}
						onRegistered={this.handleRegistered} />
				</div>)}

				{(!isUserLoggedIn() && submitted && login) && (<div className="upload-page-login-wrapper">
					<h3>Login</h3>
					<h4>Enter the email address of each member of your team to invite them to this project.</h4>
					<LoginForm
						onPage={this.props.onPage}
						onLoggedIn={this.handleLoggedIn} />
				</div>)}

				{(formState >= 0) && (<div>
					{(!sentInvites) && (<InviteForm
						invites={invites}
						onInviteChange={this.handleInviteChange}
						onFocus={this.handleInviteFocus}
						onMoreEmail={this.handleMoreEmail}
						onSubmit={this.handleInviteSubmit}
					/>)}
				</div>)}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPage);