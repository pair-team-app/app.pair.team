
import React, { Component } from 'react';
import './ProfilePage.css';

import axios from "axios/index";
import cookie from "react-cookies";
import Dropzone from 'react-dropzone';
import { Column, Row } from 'simple-flexbox';

import InputField from '../elements/InputField';
import { hasBit, isValidEmail } from '../../utils/lang';

const passwordTextfield = React.createRef();

class ProfilePage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			files         : [],
			avatar        : 'http://cdn.designengine.ai/profiles/default-avatar.png',
			username      : '',
			email         : '',
			password      : '',
			usernameValid : true,
			emailValid    : true,
			passwordValid : true,
			passMsg       : '',
			percent       : 0
		};
	}

	componentDidMount() {
		this.refreshData();
	}

	refreshData = ()=> {
		let formData = new FormData();
		formData.append('action', 'PROFILE');
		formData.append('user_id', cookie.load('user_id'));
		axios.post('https://api.designengine.ai/system.php', formData)
			.then((response)=> {
				console.log('PROFILE', response.data);

				this.setState({
					avatar   : response.data.avatar,
					username : response.data.username,
					email    : response.data.email
				});
			}).catch((error) => {
		});
	};

	onDrop(files) {
		console.log('onDrop()', files);

		this.setState({ files : files });

		let self = this;
		const config = {
			headers : {
				'content-type'    : 'multipart/form-data'
			}, onUploadProgress : function (progressEvent) {
				const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				self.setState({ percent : percent });

				if (progressEvent.loaded >= progressEvent.total) {
					self.onUploadComplete();
				}
			}
		};

		files.forEach(file => {
			let formData = new FormData();
			formData.append('file', file);

			axios.post('http://cdn.designengine.ai/upload.php?dir=/profiles&prefix=' + cookie.load('user_id') + '_', formData, config)
				.then((response) => {
					console.log("UPLOAD", response.data);
				}).catch((error) => {
			});
		});
	}

	onUploadComplete = ()=> {
		this.validateFields('avatar', 'http://cdn.designengine.ai/profiles/' + cookie.load('user_id') + '_' + this.state.files[0].name);
		this.onProfileUpdate();
	};


	onProfileUpdate = ()=> {
		console.log('onProfileUpdate()', this.state);

		const { avatar, username, email, password } = this.state;
		const { usernameValid, emailValid, passwordValid } = this.state;

		if (usernameValid && emailValid && passwordValid) {
			let formData = new FormData();
			formData.append('action', 'UPDATE_PROFILE');
			formData.append('user_id', cookie.load('user_id'));
			formData.append('username', username);
			formData.append('email', email);
			formData.append('filename', avatar);
			formData.append('password', password);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('UPDATE_PROFILE', response.data);
					const status = parseInt(response.data.status, 16);
// 					console.log('status', status, hasBit(status, 0x01), hasBit(status, 0x10));

					if (status === 0x00) {
						this.setState({
							avatar   : response.data.user.avatar,
							username : response.data.user.username,
							email    : response.data.user.email,
							passMsg  : ''
						});

					} else {
						this.setState({
							username      : hasBit(status, 0x01) ? 'Username Already in Use' : username,
							email         : hasBit(status, 0x10) ? 'Email Already in Use' : email,
							usernameValid : !hasBit(status, 0x01),
							emailValid    : !hasBit(status, 0x10)
						});
					}

				}).catch((error) => {
			});
		}
	};

	handleDropAvatar = ()=> {
		this.validateFields('avatar', 'http://cdn.designengine.ai/profiles/default-avatar.png');
		this.onProfileUpdate();
	};

	handleInputFieldBlur = (key, val)=> {
		this.validateFields(key, val);
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

		this.setState({
			usernameValid : usernameValid,
			emailValid    : emailValid,
			passwordValid : passwordValid
		});
	};

	handleInputFieldSubmit = (key, val)=> {
		this.validateFields(key, val);
		this.onProfileUpdate();
	};

	handleSubmit = ()=> {
		this.onProfileUpdate();
	};

	validateFields = (key, val)=> {
		let state = this.state;
		Object.keys(state).forEach((k, i) => {
// 			console.log('onProfileUpdate()', k, key, val);
			if (k === key) {
				state[key] = val;
			}
		});

		const { username, email, password } = state;

		const usernameValid = (username.length > 0 && !username.includes('@'));
		const emailValid = isValidEmail(email);
		const passwordValid = true;//(password.length > 0);

		console.log('validateFields()', state);

		this.setState({
			username      : (usernameValid) ? username : 'Invalid Username',
			email         : (emailValid) ? email : 'Invalid Email',
			passMsg       : (passwordValid) ? password : 'Invalid Password',
			usernameValid : usernameValid,
			emailValid    : emailValid,
			passwordValid : passwordValid
		});
	};

	render() {
		const { avatar, username, email, passMsg } = this.state;
		const { usernameValid, emailValid, passwordValid } = this.state;

		return (
			<div className="page-wrapper profile-page-wrapper">
				<h3>Profile</h3>
				<h4>A design project contains all the files for your project, including specifications, parts, and code examples.</h4>
				<div className="profile-page-avatar-wrapper"><Row vertical="center">
					<img className="profile-page-avatar-image" src={avatar} alt="Avatar" />
					<Dropzone className="profile-page-dz-wrapper" onDrop={this.onDrop.bind(this)}>
						<button className="tiny-button adjacent-button">Change</button>
					</Dropzone>
					{(!avatar.includes('/default-avatar.png')) && (<span className="page-link-small" onClick={()=> this.handleDropAvatar()}>Remove</span>)}
				</Row></div>
				<div className="profile-page-form-wrapper">
					<InputField
						type="text"
						name="username"
						placeholder="Enter new username"
						value={username}
						button="Change"
						status={(usernameValid) ? 'idle' : 'error'}
						onBlur={(val)=> this.handleInputFieldBlur('username', val)}
						onClick={()=> this.handleInputFieldClick()}
						onSubmit={(val)=> this.handleInputFieldSubmit('username', val)}
					/>

					<InputField
						type="text"
						name="email"
						placeholder="Enter new email"
						value={email}
						button="Change"
						status={(emailValid) ? 'idle' : 'error'}
						onBlur={(val)=> this.handleInputFieldBlur('email', val)}
						onClick={()=> this.handleInputFieldClick()}
						onSubmit={(val)=> this.handleInputFieldSubmit('email', val)}
					/>

					<InputField
						type="password"
						name="password"
						placeholder="Enter new password"
						value={passMsg}
						button="Change"
						status={(passwordValid) ? 'idle' : 'error'}
						onBlur={(val)=> this.handleInputFieldBlur('password', val)}
						onClick={()=> this.handleInputFieldClick()}
						onSubmit={(val)=> this.handleInputFieldSubmit('password', val)}
					/>
				</div>

				<button type="submit" className="fat-button" onClick={()=> this.handleSubmit()}>Submit</button>
			</div>
		);
	}
}

export default ProfilePage;
