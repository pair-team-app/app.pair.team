
import React, { Component } from 'react';
import './ProfilePage.css';

import axios from 'axios/index';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import { POPUP_TYPE_INFO } from '../elements/Popup';
import InputField, { INPUTFIELD_STATUS_ERROR, INPUTFIELD_STATUS_IDLE } from '../forms/elements/InputField';
import { DEFAULT_AVATAR } from '../../consts/uris';
import { updateUserProfile } from '../../redux/actions';
import { hasBit, isValidEmail } from '../../utils/funcs';
import { trackEvent } from '../../utils/tracking';


const mapStateToProps = (state, ownProps)=> {
	return ({ profile : state.userProfile });
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
			percent       : 0
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
	}


	handleDropAvatar = ()=> {
		trackEvent('button', 'drop-avatar');
		this.onValidateFields('avatar', DEFAULT_AVATAR);
		this.onProfileUpdate();
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
						this.onProfileUpdate();
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
		let { usernameValid, emailValid, passwordValid } = this.state;

		if (key === 'username') {
			usernameValid = true;

		} else if (key === 'email') {
			emailValid = true;

		} else if (key === 'password') {
			passwordValid = true;
		}

		this.setState({ usernameValid, emailValid, passwordValid });
	};

	handleInputFieldChange = (key, val)=> {
		this.setState({ [key] : val });
	};

	handleInputFieldSubmit = (key, val)=> {
// 		console.log('ProfilePage.handleInputFieldSubmit()', key, val);

		trackEvent('button', key);

		this.onValidateFields(key, val);
		this.onProfileUpdate();
	};

	handleSubmit = ()=> {
// 		console.log('ProfilePage.handleSubmit()');

		trackEvent('button', 'save');

		this.onValidateFields();
		this.onProfileUpdate();
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
				type    : POPUP_TYPE_INFO,
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

		console.log('ProfilePage.onValidateFields()', state);

		this.setState({
			username      : (usernameValid) ? username : (username.includes('@')) ? 'Usernames cannot contain \'@\'' : 'Invalid Username',
			email         : (emailValid) ? email : 'Invalid Email',
			passMsg       : (passwordValid) ? password : 'Invalid Password',
			usernameValid : usernameValid,
			emailValid    : emailValid,
			passwordValid : passwordValid
		});
	};

	render() {
// 		console.log('ProfilePage.render()', this.props, this.state);

		const { avatar, username, email } = (this.props.profile) ? this.props.profile : this.state;
		const { passMsg, usernameValid, emailValid, passwordValid } = this.state;

		return (
			<div className="page-wrapper profile-page-wrapper">
				<h3>Profile</h3>
				<div className="profile-page-avatar-wrapper">
					<Dropzone className="profile-page-dz-wrapper" multiple={false} disablePreview={true} onDrop={this.handleFileDrop.bind(this)}><Row vertical="center">
						<img className="profile-page-avatar-image" src={avatar} alt="Avatar" />
						<button className="tiny-button adjacent-button">Change</button>
					</Row></Dropzone>
					{(!avatar.includes('avatar-default.png')) && (<div className="page-link-small" style={{ width : '58px', textAlign : 'center' }} onClick={()=> this.handleDropAvatar()}>Remove</div>)}
				</div>
				<div className="profile-page-form-wrapper">
					<InputField
						type="text"
						name="username"
						placeholder="Enter new username"
						value={username}
						button="Change"
						status={(usernameValid) ? INPUTFIELD_STATUS_IDLE : INPUTFIELD_STATUS_ERROR}
						onChange={(val)=> this.handleInputFieldChange('username', val)}
						onClick={()=> this.handleInputFieldClick()}
						onSubmit={(val)=> this.handleInputFieldSubmit('username', val)}
					/>

					<InputField
						type="text"
						name="email"
						placeholder="Enter new email"
						value={email}
						button="Change"
						status={(emailValid) ? INPUTFIELD_STATUS_IDLE : INPUTFIELD_STATUS_ERROR}
						onChange={(val)=> this.handleInputFieldChange('email', val)}
						onClick={()=> this.handleInputFieldClick()}
						onSubmit={(val)=> this.handleInputFieldSubmit('email', val)}
					/>

					<InputField
						type="password"
						name="password"
						placeholder="Enter new password"
						value={passMsg}
						button="Change"
						status={(passwordValid) ? INPUTFIELD_STATUS_IDLE : INPUTFIELD_STATUS_ERROR}
						onChange={(val)=> this.handleInputFieldChange('password', val)}
						onClick={()=> this.handleInputFieldClick()}
						onSubmit={(val)=> this.handleInputFieldSubmit('password', val)}
					/>
				</div>

				<button type="submit" className="long-button" onClick={()=> this.handleSubmit()}>Save</button>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
