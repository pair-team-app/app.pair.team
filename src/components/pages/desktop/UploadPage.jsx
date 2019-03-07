
import React, { Component } from 'react';
import './UploadPage.css';

import axios from 'axios';
import cookie from 'react-cookies';
import { connect } from 'react-redux';

import BaseDesktopPage from './BaseDesktopPage';
import UploadHeader from '../../elements/UploadHeader';
import LoginForm from '../../forms/LoginForm';
import RegisterForm from '../../forms/RegisterForm';

import homeContent from '../../../assets/json/home-content';
import { addFileUpload, updateDeeplink, updateUserProfile } from '../../../redux/actions';
import { buildInspectorPath, isUserLoggedIn, sendToSlack } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';
import radioButtons from '../../../assets/json/radio-buttons_upload';


const mapStateToProps = (state, ownProps)=> {
	return ({
		file     : state.file,
		deeplink : state.deeplink,
		profile  : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		addFileUpload     : (file)=> dispatch(addFileUpload(file)),
		updateDeeplink    : (navIDs)=> dispatch(updateDeeplink(navIDs)),
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


class UploadPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			section        : window.location.pathname.split('/').pop(),
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

	componentWillUnmount() {
		console.log('UploadPage.componentWillUnmount()', this.state);

		const { file } = this.state;
		if (file) {
			this.props.addFileUpload(null);
			this.setState({ file : null });
		}
	}


	handleCancel = ()=> {
		console.log('UploadPage.handleCancel()');
		this.setState({
			file      : null,
			title     : '',
			formState : 0
		});

		const { section } = this.state;
		this.props.onPage(section);
	};

	handleFile = (file)=> {
		console.log('UploadPage.handleFile()', file, this.props, this.state);

		const { id, email } = (this.props.profile) ? this.props.profile : this.state.profile;
		sendToSlack(`*[${id}]* *${email}* started uploading file "_${file.name}_" (\`${(file.size / (1024 * 1024)).toFixed(2)}MB\`)`);
		trackEvent('upload', 'file');

		this.setState({
			formState : 1,
			file      : file,
			title     : file.name.split('.').slice(0, -1).join('.')
		});

		const config = {
			headers            : { 'content-type' : 'multipart/form-data' },
			onDownloadProgress : (progressEvent)=> {},
			onUploadProgress   : (progressEvent)=> {
				const { formState } = this.state;
				const { loaded, total } = progressEvent;

				const percent = Math.round((loaded * 100) / total);
				this.setState({ percent });

				if (progressEvent.loaded >= progressEvent.total && formState === 1) {
					if (formState === 1) {
						sendToSlack(`*[${id}]* *${email}* completed uploading file "_${file.name}_" (\`${(file.size / (1024 * 1024)).toFixed(2)}MB\`)`);

						this.setState({
							percent        : 100,
							uploadComplete : true
						});
						this.onUploadSubmit();

					} else {
						this.setState({ percent : 0 });
					}
				}
			}
		};

		let formData = new FormData();
		formData.append('file', file);
		axios.post('http://cdn.designengine.ai/upload.php?dir=/system', formData, config)
			.then((response)=> {
				console.log("UPLOAD", response.data);
			}).catch((error)=> {
			sendToSlack(`*${email}* failed uploading file _${file.name}_`);
		});
	};

	handleLogin = ()=> {
		console.log('UploadPage.handleLogin()');

		trackEvent('button', 'login');
		this.props.onScrollOrigin();
		this.setState({
			showRegister : false,
			showLogin    : true
		});
	};

	handleLoggedIn = (profile)=> {
		console.log('UploadPage.handleLoggedIn()', profile);

		trackEvent('user', 'login');
		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);
		this.onUploadSubmit(profile);
	};

	handleRegistered = (profile)=> {
		console.log('UploadPage.handleRegistered()', profile);

		trackEvent('user', 'sign-up');
		cookie.save('user_id', profile.id, { path : '/' });

		this.props.updateUserProfile(profile);
		this.onUploadSubmit(profile);
	};

	onUploadSubmit = (userProfile)=> {
		console.log('UploadPage.onUploadSubmit()', userProfile, this.state);

		const { pathname } = window.location;
		const profile = (userProfile && typeof userProfile !== 'undefined') ? userProfile : this.props.profile;
		const { title, description, radioIndex, file, uploadComplete } = this.state;
		const { name, size } = file;
		const titleValid = (title.length > 0);

		this.setState({ titleValid });

		if (titleValid && uploadComplete) {
			if (isUserLoggedIn()) {
				trackEvent('button', 'submit');
				this.setState({ formState : 2 });

				let formData = new FormData();
				formData.append('action', 'NEW_UPLOAD');
				formData.append('user_id', profile.id);
				formData.append('title', title);
				formData.append('description', description);
				formData.append('filesize', size);
				formData.append('private', (radioIndex === 1) ? '0' : '1');
				formData.append('filename', `http://cdn.designengine.ai/system/${name}`);
				axios.post('https://api.designengine.ai/system.php', formData)
					.then((response)=> {
						console.log('NEW_UPLOAD', response.data);
						const { upload } = response.data;

						this.props.updateDeeplink({
							uploadID   : upload.id,
							pageID     : this.props.deeplink.pageID,
							artboardID : this.props.deeplink.artboardID
						});

						this.props.addFileUpload(null);
						this.props.onProcessing(true);
						this.props.onPage(buildInspectorPath(upload, `/${pathname.split('/').pop()}`));
					}).catch((error)=> {
				});

			} else {
				this.setState({ showRegister : true });
			}
		}
	};


	render() {
		console.log('UploadPage.render()', this.props, this.state);

		const { section, formState, file, percent, uploadComplete, showLogin, showRegister } = this.state;

		const uploadTitle = (formState === 1 && !uploadComplete) ? `Uploading ${file.name}…` : (section) ? homeContent[section].header.title : '';
		const uploadSubtitle = (formState === 1 && !uploadComplete) ? `${((file.size / (1024 * 1024)) * (percent * 0.01)).toFixed(2)} of ${(file.size / (1024 * 1024)).toFixed(2)}MB has been uploaded.` : 'Drag, drop, or click to upload.';

		const pageStyle = { marginBottom : (formState === 1 && uploadComplete) ? '30px' : '30px' };
		const progressStyle = { width : `${percent}%` };

		return (
			<BaseDesktopPage className="upload-page-wrapper" style={pageStyle}>
				{(formState === 1) && (<div className="upload-progress-bar-wrapper">
					<div className="upload-progress-bar" style={progressStyle} />
				</div>)}

				{(formState <= 1 && !uploadComplete) && (<UploadHeader
					dialog={false}
					uploading={(formState === 1)}
					title={uploadTitle}
					subtitle={uploadSubtitle}
					onCancel={this.handleCancel}
					onFile={this.handleFile}
					onPage={this.props.onPage}
					onPopup={this.props.onPopup} />)}

				{(!isUserLoggedIn() && showRegister && !showLogin) && (<div className="upload-page-register-wrapper">
					<RegisterForm
						title="To finish uploading, please sign up."
						onLogin={this.handleLogin}
						onRegistered={this.handleRegistered} />
				</div>)}

				{(!isUserLoggedIn() && showLogin && !showRegister) && (<div className="upload-page-login-wrapper">
					<LoginForm
						title="To finish uploading, please login."
						onPage={this.props.onPage}
						onLoggedIn={this.handleLoggedIn} />
				</div>)}
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UploadPage);
