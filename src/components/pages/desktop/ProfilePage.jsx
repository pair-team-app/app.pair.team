
import React, { Component } from 'react';
import './ProfilePage.css';

import axios from 'axios/index';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import ImageLoader from 'react-loading-image';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import BaseDesktopPage from './BaseDesktopPage';
import { POPUP_TYPE_OK } from '../../elements/Popup';
import InputField, {
	INPUTFIELD_STATUS_DISABLED,
	INPUTFIELD_STATUS_ERROR,
	INPUTFIELD_STATUS_IDLE
} from '../../forms/elements/InputField';
import { DEFAULT_AVATAR } from '../../../consts/uris';
import { updateUserProfile } from '../../../redux/actions';
import { hasBit, isValidEmail } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';

const dropZone = React.createRef();


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


class ProfilePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			file          : null,
			avatar        : DEFAULT_AVATAR,
			username      : '',
			email         : '',
			password      : '',
			usernameValid : true,
			emailValid    : true,
			passwordValid : true,
			passMsg       : '',
			status        : 0x00,
			percent       : 0,
			dialog        : false
		};
	}

	componentDidMount() {
// 		console.log('ProfilePage.componentDidMount()', this.props, this.state);
		if (this.props.profile) {
			const { avatar, username, email } = this.props.profile;
			this.setState({ avatar, username, email });
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('ProfilePage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (prevProps.profile !== this.props.profile) {
			const { avatar, username, email, status } = this.props.profile;

			this.setState({
				avatar        : avatar,
				username      : username,
				email         : email,
				usernameValid : !hasBit(status, 0x01),
				emailValid    : !hasBit(status, 0x10)
			});
		}

		if (this.state.dialog) {
			if (dropZone.current && dropZone.current.fileInputEl) {
				dropZone.current.fileInputEl.click();
			}
		}
	}


	handleAvatarClick = ()=> {
		console.log('ProfilePage.handleAvatarClick()');
		trackEvent('button', 'upload');

		this.setState({ dialog : true }, ()=> this.setState({ dialog : false }));
	};

	handleBuyClick = ()=> {
		console.log('ProfilePage.handleBuyCLick()');
		trackEvent('button', 'buy');
	};

	handleCancel = ()=> {
		console.log('ProfilePage.handleCancel()');

		trackEvent('button', 'cancel');
		const { avatar, username, email } = this.props.profile;

		this.setState({
			avatar        : avatar,
			username      : username,
			email         : email,
			password      : '',
			passMsg       : '',
			usernameValid : true,
			emailValid    : true
		});
	};

	handleDropAvatar = ()=> {
		trackEvent('button', 'drop-avatar');
		this.onValidateFields('avatar', DEFAULT_AVATAR);
	};

	handleFileDialogCancel = ()=> {
		console.log('ProfilePage.handleFileDialogCancel()');
		this.setState({ dialog : false });
	};

	handleFileDrop = (files)=> {
// 		console.log('ProfilePage.handleFileDrop()', files);

		if (files.length > 0) {
			const file = files.pop();
			const { profile } = this.props;

			const config = {
				headers             : { 'content-type' : 'multipart/form-data' },
				onDownloadProgress  : (progressEvent)=> {},
				onUploadProgress    : (progressEvent)=> {
					const { loaded, total } = progressEvent;
					const percent = Math.round((loaded * 100) / total);
					this.setState({ percent });

					if (progressEvent.loaded >= progressEvent.total) {
						this.onValidateFields('avatar', `http://cdn.designengine.ai/profiles/${profile.id}_${file.name}`);
					}
				}
			};

			const re = /jpe?g|png|svg/;
			if (re.test(file.name.split('.').slice().pop())) {
				this.setState({ file });
				trackEvent('button', 'change-avatar');

				let formData = new FormData();
				formData.append('file', file);
				axios.post(`http://cdn.designengine.ai/upload.php?dir=/profiles&prefix=${profile.id}_`, formData, config)
					.then((response)=> {
						console.log("AVATAR_UPLOAD", response.data);
					}).catch((error)=> {
				});
			}
		}
	};

	handleInputFieldClick = (key)=> {
		console.log('ProfilePage.handleInputFieldClick()', key, this.state);

		let { username, email, usernameValid, emailValid, passwordValid } = this.state;

		if (key === 'username') {
			if (!usernameValid) {
				username = this.props.profile.username;
			}
			usernameValid = true;

		} else if (key === 'email') {
			if (!emailValid) {
				email = this.props.profile.email;
			}
			emailValid = true;

		} else if (key === 'password') {
			passwordValid = true;
		}

		this.setState({ username, email, usernameValid, emailValid, passwordValid });
	};

	handleInputFieldChange = (key, val)=> {
// 		console.log('ProfilePage.handleInputFieldChange()', key, val);

		this.setState({
			[key]   : val,
			passMsg : (key === 'password') ? val : this.state.passMsg
		});
	};

	handleInputFieldSubmit = (key, val)=> {
// 		console.log('ProfilePage.handleInputFieldSubmit()', key, val);

		trackEvent('button', key);

		this.onValidateFields(key, val);
	};

	handleSubmit = ()=> {
// 		console.log('ProfilePage.handleSubmit()');

		trackEvent('button', 'save');

		this.onValidateFields();
	};

	onProfileUpdate = ()=> {
		console.log('ProfilePage.onProfileUpdate()', this.state);

		const { avatar, username, email, password } = this.state;
		const { usernameValid, emailValid, passwordValid } = this.state;

		if (usernameValid && emailValid && passwordValid) {
			const { id } = this.props.profile;
			this.props.updateUserProfile({ id, avatar, username, email, password });
			this.setState({ passMsg : '' });

			this.props.onPopup({
				type    : POPUP_TYPE_OK,
				content : 'Profile updated.'
			});
		}
	};

	onValidateFields = (key=null, val=null)=> {
		let state = this.state;
		Object.keys(state).forEach((k, i)=> {
			if (k === key) {
				state[key] = val;
			}
		});

		const { username, email, password } = state;
		const usernameValid = (username.length > 0 && !username.includes('@'));
		const emailValid = isValidEmail(email);
		const passwordValid = true;//(password.length > 0);

		console.log(' -=- ProfilePage.onValidateFields()', emailValid, state);

		this.setState({
			username      : (usernameValid) ? username : (username.includes('@')) ? 'Usernames Cannot Contain \'@\'' : 'Username Invalid',
			email         : (emailValid) ? email : 'Email Address Invalid',
			passMsg       : (passwordValid) ? password : 'Password Invalid',
			usernameValid : usernameValid,
			emailValid    : emailValid,
			passwordValid : passwordValid
		});

		if (usernameValid && emailValid && passwordValid) {
			this.onProfileUpdate();
		}
	};

	render() {
// 		console.log('ProfilePage.render()', this.props, this.state);

// 		const { avatar, username, email } = (this.props.profile) ? this.props.profile : this.state;
		const { profile } = this.props;
		const { avatar, username, email, password } = this.state;
		const { passMsg, usernameValid, emailValid, passwordValid } = this.state;

		return (
			<BaseDesktopPage className="profile-page-wrapper">
				<h4>Profile</h4>
				<div className="profile-page-avatar-wrapper">
					<Row vertical="center">
						<Dropzone className="profile-page-dz-wrapper" multiple={false} disablePreview={true} onDrop={this.handleFileDrop.bind(this)} onFileDialogCancel={this.handleFileDialogCancel} ref={dropZone}>
							<div className="profile-page-avatar-image-wrapper">
								<ImageLoader
									src={avatar}
									image={(props)=> (<img className="profile-page-avatar-image" {...props} src={avatar} alt="" />)}
									loading={()=> (<div className="profile-page-avatar-image profile-page-avatar-image-loading"><FontAwesome name="circle-o-notch" size="2x" pulse fixedWidth /></div>)}
									error={()=> (<div className="profile-page-avatar-image profile-page-avatar-image-error"><FontAwesome name="exclamation-circle" size="2x" /></div>)}
								/>
							</div>

							{/*<img className="profile-page-avatar-image" src={avatar} alt="" />*/}
						</Dropzone>
						<button className="adjacent-button" onClick={()=> this.handleAvatarClick()}>{(avatar.includes('avatar-default.png')) ? 'Upload' : 'Replace'}</button>
						<div className={`page-link${(avatar.includes('avatar-default.png')) ? ' page-link-disabled' : ''}`} onClick={()=> this.handleDropAvatar()}>Remove</div>
					</Row>
				</div>

				{/*{(profile) && (<div className="profile-page-paid-wrapper">*/}
				{/*<h5>Account Type: {(profile.paid) ? 'Paid' : 'Free'}</h5>*/}
				{/*{(!profile.paid) && (<button onClick={()=> this.handleBuyClick()}>Unlimited</button>)}*/}
				{/*</div>)}*/}

				<div className="profile-page-form-wrapper">
					<InputField
						type="text"
						name="username"
						placeholder="Enter New Username"
						value={username}
						button="Change"
						status={(usernameValid) ? INPUTFIELD_STATUS_IDLE : INPUTFIELD_STATUS_ERROR}
						onChange={(val)=> this.handleInputFieldChange('username', val)}
						onClick={()=> this.handleInputFieldClick('username')}
						onSubmit={(val)=> this.handleInputFieldSubmit('username', val)}
					/>

					<InputField
						type="text"
						name="email"
						placeholder="Enter New Email Address"
						value={email}
						button="Change"
						status={(emailValid) ? INPUTFIELD_STATUS_IDLE : INPUTFIELD_STATUS_ERROR}
						onChange={(val)=> this.handleInputFieldChange('email', val)}
						onClick={()=> this.handleInputFieldClick('email')}
						onSubmit={(val)=> this.handleInputFieldSubmit('email', val)}
					/>

					<InputField
						type="password"
						name="password"
						placeholder="Enter New Password"
						value={passMsg}
						button="Change"
						status={(passwordValid) ? INPUTFIELD_STATUS_IDLE : INPUTFIELD_STATUS_ERROR}
						onChange={(val)=> this.handleInputFieldChange('password', val)}
						onClick={()=> this.handleInputFieldClick('password')}
						onSubmit={(val)=> this.handleInputFieldSubmit('password', val)}
					/>

					<InputField
						type="text"
						name="paid"
						placeholder="Free Account"
						value={(profile && profile.paid) ? 'Unlimited Account' : 'Free Account'}
						button={(profile && profile.paid) ? 'Free' : 'Unlimited'}
						status={INPUTFIELD_STATUS_DISABLED}
						onChange={(val)=> this.handleInputFieldChange('paid', val)}
						onClick={()=> this.handleInputFieldClick('paid')}
						onSubmit={(val)=> this.handleInputFieldSubmit('paid', val)}
					/>
				</div>

				<Row vertical="center">
					<button type="submit" disabled={false && (!profile || (profile.avatar === avatar && profile.username === username && profile.email === email && password.length === 0))} className="long-button adjacent-button" onClick={()=> this.handleSubmit()}>Save</button>
					<div className={`page-link${(profile && (profile.avatar !== avatar || profile.username !== username || profile.email !== email || password.length > 0)) ? '' : ' page-link-disabled'}`} onClick={()=> this.handleCancel()}>Cancel</div>
				</Row>
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
