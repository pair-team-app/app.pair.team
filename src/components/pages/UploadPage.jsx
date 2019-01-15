
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Column, Row } from 'simple-flexbox';

import InviteTeamForm from '../forms/InviteTeamForm';
import LoginForm from '../elements/LoginForm';
import RegisterForm from '../elements/RegisterForm';
import RadioButton from '../elements/RadioButton';

import { addFileUpload, updateNavigation, updateUserProfile } from '../../redux/actions';
import { buildInspectorPath, isUserLoggedIn, sendToSlack } from '../../utils/funcs';
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


function UploadForm(props) {
	const { header, subheader, title, description, radioButtons, percent, uploadComplete, titleValid } = props;

	const titleClass = (titleValid) ? 'input-wrapper' : 'input-wrapper input-wrapper-error';
	const nextButtonClass = (uploadComplete && titleValid) ? 'fat-button upload-page-submit-button' : 'fat-button upload-page-submit-button button-disabled';

	return (<div>
		<div style={{ width : '100%' }}>
			<h3>{header}</h3>
			<h4>{subheader}</h4>
			<div className="upload-page-form-wrapper">
				<div style={{ width : '33%' }}>
					<div className={titleClass}>
						<input type="text" name="title" placeholder="File name" value={title} onChange={props.onChange} ref={titleTextfield} />
					</div>
				</div>
				<div className="input-wrapper">
					<input type="text" name="description" placeholder="File Description (Optional)" value={description} onChange={props.onChange} />
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
				<button className={nextButtonClass} onClick={() => (uploadComplete && title.length > 0) ? props.onSubmit() : null}>{(percent > 0 && percent < 100) ? 'Uploading Design' : 'Submit Design'}</button>
			</div>
		</div>
	</div>);
}

function UploadHeader(props) {
	const { formState, title } = props;

	return (<div className="upload-page-header-wrapper">
		{(formState === -2) && (
			<Dropzone className="upload-page-header-dz-wrapper" onDrop={props.onDrop}>
				<Row horizontal="center"><img className="upload-page-icon" src={uploadIcon} alt="Upload" /></Row>
				<Row horizontal="center">{title}</Row>
			</Dropzone>
		)}
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
			profile        : {
				id    : 0,
				email : "NOT LOGGED IN"
			},
			invites        : [],
			radioButtons   : radioButtons,
			radioIndex     : 1
		};
	}

	componentDidMount() {
		console.log('UploadPage.componentDidMount()', this.props, this.state);

		const { file } = this.props;
		if (file) {
			this.onDrop([file]);
		}

		const { radioIndex } = this.state;
		radioButtons.filter((radioButton)=> (radioButton.id === radioIndex)).forEach((radioButton)=> {
			radioButton.selected = true;
		});

		this.setState({ radioButtons });
	}

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

	handleInviteTeamFormSubmitted = (result)=> {
		console.log('UploadPage.handleInviteTeamFormSubmitted()', result);
		this.setState({ sentInvites : true });
	};

	handleLoggedIn = (profile)=> {
		console.log('UploadPage.handleLoggedIn()', profile);

		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);
		this.handleUploadSubmit(profile);
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

	handleUploadChange = (event)=> {
		console.log('UploadPage.handleUploadChange()', event.target);
		this.setState({ [event.target.name] : event.target.value });
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
						this.props.onPage(buildInspectorPath(upload, window.location.pathname.split('/').pop()));
					}).catch((error) => {
				});

			} else {
				this.setState({ registering : true });
			}
		}
	};

	onDrop = (files)=> {
		console.log('UploadPage.onDrop()', files);

		const { id, email } = (this.props.profile) ? this.props.profile : this.state;
		if (files.length > 0) {
			const file = files.pop();

			if (file.name.split('.').pop() === 'sketch') {
				if (file.size < 100 * (1024 * 1024)) {
					sendToSlack('*[' + id + ']* *' + email + '* started uploading file "_' + file.name + '_"');

					this.setState({
						formState : -1,
						file      : file,
						title     : file.name.split('.').slice(0, -1).join('.'),
						action    : 'UPLOAD'
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
								const { id, email } = (this.props.profile) ? this.props.profile : this.state;
								const { file } = this.state;

								sendToSlack('*[' + id + ']* *' + email + '* - "_' + file.name + '_" uploaded');
								this.setState({ uploadComplete : true });
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
	};


	render() {
		console.log('UploadPage.render()', this.props, this.state);

		const { profile } = this.props;
		const { title, description, radioButtons } = this.state;
		const { formState, percent, uploadComplete, submitted, login, sentInvites, titleValid } = this.state;

		const header = (window.location.pathname.split('/').pop() === 'inspect') ? 'Do you need specs & code from a design file?' : 'Do you need parts & source from a design file?';
		const subheader = (window.location.pathname.split('/').pop() === 'inspect') ? 'Upload any Sketch file to Design Engine to inspect design specs & code.' : 'Upload any Sketch file to Design Engine to download parts & source.';

		const progressStyle = { width : percent + '%' };

		return (
			<div className="page-wrapper upload-page-wrapper">
				{(formState === -1 && (percent > 0 && percent < 100)) && (
					<div className="upload-progress-bar-wrapper">
						<div className="upload-progress-bar" style={progressStyle} />
					</div>
				)}

				{(formState < 0) && (<UploadHeader
					formState={formState}
					title={(window.location.pathname.split('/').pop() === 'inspect') ? 'Drag & Drop any Sketch file here to inspect design specs & code.' : 'Drag & Drop any Sketch file here to download parts & source.'}
					onDrop={this.onDrop.bind(this)}
				/>)}

				{(formState < 0 && !submitted) && (<div className="upload-page-upload-wrapper">
					<UploadForm
						formState={formState}
						header={header}
						subheader={subheader}
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

				{(formState >= 0 && !sentInvites) && (<div className="upload-page-invite-wrapper">
					<InviteTeamForm profile={profile} onSubmitted={this.handleInviteTeamFormSubmitted} />
				</div>)}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPage);