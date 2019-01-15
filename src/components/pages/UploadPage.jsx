
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Column } from 'simple-flexbox';

import UploadHeader from '../elements/UploadHeader';
import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';
import RadioButton from '../forms/elements/RadioButton';

import { addFileUpload, updateNavigation, updateUserProfile } from '../../redux/actions';
import { buildInspectorPath, isUserLoggedIn, sendToSlack } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';
import radioButtons from '../../json/radio-buttons_upload';

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
	const { header, subheader, title, description, radioButtons, formState, uploadComplete, titleValid } = props;

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
				{(formState > 0) && (<button className={nextButtonClass} onClick={() => (uploadComplete && title.length > 0) ? props.onSubmit() : null}>{(!uploadComplete) ? 'Uploading Design' : 'Submit Design'}</button>)}
			</div>
		</div>
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
			formState      : 0,
			titleValid     : true,
			showLogin      : false,
			showRegister   : false,
			uploadComplete : false,
			profile        : {
				id       : 0,
				username : 'Anonymous',
				email    : 'anon@designengine.ai'
			},
			radioButtons   : radioButtons,
			radioIndex     : 1
		};
	}

	componentDidMount() {
		console.log('UploadPage.componentDidMount()', this.props, this.state);

		const { file } = this.props;
		if (file) {
			this.handleFile(file);
		}

		const { radioIndex } = this.state;
		let radioButtons = [...this.state.radioButtons];
		radioButtons.forEach((radioButton)=> {
			radioButton.selected = (radioButton.id === radioIndex);
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

	handleFile = (file)=> {
		console.log('UploadPage.handleFile()', file, this.props, this.state);

		const { id, email } = (this.props.profile) ? this.props.profile : this.state.profile;
		if (file.name.split('.').pop() === 'sketch') {
			if (file.size < 100 * (1024 * 1024)) {
				sendToSlack('*[' + id + ']* *' + email + '* started uploading file "_' + file.name + '_"');

				this.setState({
					formState : 1,
					file      : file,
					title     : file.name.split('.').slice(0, -1).join('.')
				});

				const config = {
					headers            : { 'content-type' : 'multipart/form-data' },
					onDownloadProgress : (progressEvent)=> {},
					onUploadProgress   : (progressEvent)=> {
						const { loaded, total } = progressEvent;
						const percent = Math.round((loaded * 100) / total);
						this.setState({ percent });

						if (progressEvent.loaded >= progressEvent.total) {
							sendToSlack('*[' + id + ']* *' + email + '* completed uploading file "_' + file.name + '_" uploaded');
							this.setState({
								percent        : 100,
								uploadComplete : true
							});
						}
					}
				};

				let formData = new FormData();
				formData.append('file', file);
				axios.post('http://cdn.designengine.ai/upload.php?dir=%2Fsystem', formData, config)
					.then((response) => {
						console.log("UPLOAD", response.data);
					}).catch((error) => {
					sendToSlack('*' + email + '* failed uploading file _' + file.name + '_');
				});

			} else {
				sendToSlack('*[' + id + ']* *' + email + '* uploaded oversized file "_' + file.name + '_" (' + Math.round(file.size * (1 / (1024 * 1024))) + 'MB)');
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
	};

	handleLogin = ()=> {
		console.log('UploadPage.handleLogin()');
		this.setState({
			showRegister : false,
			showLogin    : true
		});
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
		console.log('UploadPage.handleUploadSubmit()', userProfile, this.state);

		const profile = (userProfile) ? userProfile : this.props.profile;
		const { title, description, radioIndex, file, uploadComplete } = this.state;
		const { name, size } = file;
		const titleValid = (title.length > 0);

		this.setState({ titleValid });

		if (titleValid && uploadComplete) {
			console.log(':::::: GOOD FOR SUBMIT ::::::::');
			if (isUserLoggedIn()) {
				console.log(':::::: LOGGED IN ::::::::');
				this.setState({ formState : 2 });

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
				console.log(':::::: NEED LOG IN ::::::::');
				this.setState({ showRegister : true });
			}
		}
	};


	render() {
		console.log('UploadPage.render()', this.props, this.state);

		const { title, description, radioButtons, titleValid, file } = this.state;
		const { formState, percent, uploadComplete, showLogin, showRegister } = this.state;

		const uploadTitle = (window.location.pathname.split('/').pop() === 'inspect') ? 'Drag & Drop any Sketch file here to inspect design specs & code.' : 'Drag & Drop any Sketch file here to download parts & source.';
		const header = (formState === 1 && !uploadComplete) ? 'Uploading' : (window.location.pathname.split('/').pop() === 'inspect') ? 'Do you need specs & code from a design file?' : 'Do you need parts & source from a design file?';
		const subheader = (formState === 1 && !uploadComplete) ? 'Currently uploading "' + file.name + '" to be processed by Design Engine.' : (window.location.pathname.split('/').pop() === 'inspect') ? 'Upload any Sketch file to Design Engine to inspect design specs & code.' : 'Upload any Sketch file to Design Engine to download parts & source.';

		const progressStyle = { width : percent + '%' };

		return (
			<div className="page-wrapper upload-page-wrapper">
				{(formState === 0) && (<UploadHeader
					title={uploadTitle}
					onFile={this.handleFile}
					onPopup={this.props.onPopup} />)
				}

				{(formState === 1 && (percent > 0 && percent < 100)) && (
					<div className="upload-progress-bar-wrapper">
						<div className="upload-progress-bar" style={progressStyle} />
					</div>
				)}

				{(formState <= 1 && !showLogin && !showRegister) && (<div className="upload-page-upload-wrapper">
					<UploadForm
						formState={formState}
						header={header}
						subheader={subheader}
						title={title}
						description={description}
						radioButtons={radioButtons}
						titleValid={titleValid}
						uploadComplete={uploadComplete}
						onChange={this.handleUploadChange}
						onRadioButton={this.handleRadioButton}
						onSubmit={this.handleUploadSubmit}
					/>
				</div>)}

				{(!isUserLoggedIn() && showRegister && !showLogin) && (<div className="upload-page-register-wrapper">
					<h3>Sign Up for Design Engine</h3>
					<h4>Enter Username, Email, & Password to Sign Up for Design Engine.</h4>
					<RegisterForm
						onLogin={this.handleLogin}
						onRegistered={this.handleRegistered} />
				</div>)}

				{(!isUserLoggedIn() && showLogin && !showRegister) && (<div className="upload-page-login-wrapper">
					<h3>Login to Design Engine</h3>
					<h4>Enter Username or Email & Password to Login to Design Engine.</h4>
					<LoginForm
						onPage={this.props.onPage}
						onLoggedIn={this.handleLoggedIn} />
				</div>)}
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPage);