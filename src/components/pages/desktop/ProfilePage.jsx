
import React, { Component } from 'react';
import './ProfilePage.css';

import axios from 'axios/index';
import Dropzone from 'react-dropzone';
import FontAwesome from 'react-fontawesome';
import ImageLoader from 'react-loading-image';
import { connect } from 'react-redux';
import {Column, Row} from 'simple-flexbox';

import BaseDesktopPage from './BaseDesktopPage';
import IntegrationGridItem from '../../iterables/IntegrationGridItem';
import ConfirmDialog from '../../overlays/ConfirmDialog';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../../overlays/PopupNotification';
import InputField, { INPUTFIELD_STATUS_ERROR, INPUTFIELD_STATUS_IDLE } from '../../forms/InputField/InputField';
import { DEFAULT_AVATAR, CDN_UPLOAD_URL } from '../../../consts/uris';
import { updateUserProfile } from '../../../redux/actions';
import { Bits, Files, Strings } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';
import integrationItems from '../../../assets/json/integrations';

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


const ProfilePageIntegrationsGrid = (props)=> {
// 	console.log('ProfilePage.ProfilePageIntegrationsGrid()', props);

	const { title, items } = props;
	return (<div className="profile-page-integrations-grid">
		<h4>{title}</h4>
		<Row horizontal="start" className="profile-page-integrations-grid-item-wrapper" style={{ flexWrap : 'wrap' }}>
			{items.map((item, i) => {
				return (<Column key={i}>
					<IntegrationGridItem
						title={item.title}
						image={item.filename}
						selected={true}
						inheritedClass="profile-page-integrations-grid-item"
					/>
				</Column>);
			})}
		</Row>
		<button className="long-button" onClick={()=> {trackEvent('button', 'integrations'); props.onClick()}}>{(items.length === 0) ? 'Setup' : 'Change'}</button>
	</div>);
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
			type          : '',
			usernameValid : true,
			emailValid    : true,
			passwordValid : true,
			passMsg       : '',
			status        : 0x00,
			integrations  : [],
			changed       : false,
			percent       : 0,
			fileDialog    : false,
			confirmDialog : false
		};
	}

	componentDidMount() {
// 		console.log('ProfilePage.componentDidMount()', this.props, this.state);

		if (this.props.profile) {
			const { profile } = this.props;
			const { avatar, username, email, type } = profile;
			const integrations = integrationItems.filter((integration)=> (profile.sources.includes(integration.id) || profile.integrations.includes(integration.id)));

			this.setState({ avatar, username, email, type, integrations });
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('ProfilePage.componentDidUpdate()', prevProps, this.props, prevState, this.state);

		if (!prevProps.profile && this.props.profile) {
			const { profile } = this.props;
			const integrations = integrationItems.filter((integration)=> (profile.sources.includes(integration.id) || profile.integrations.includes(integration.id)));
			this.setState({ integrations });
		}

		if (prevProps.profile !== this.props.profile) {
			const { profile } = this.props;
			const { avatar, username, email, type, status } = profile;

			this.setState({ avatar, username, email, type,
				usernameValid : !Bits.contains(status, 0x01),
				emailValid    : !Bits.contains(status, 0x10),
				integrations  : integrationItems.filter((integration)=> (profile.sources.includes(integration.id) || profile.integrations.includes(integration.id)))
			});
		}

		if (this.state.fileDialog) {
			if (dropZone.current && dropZone.current.fileInputEl) {
				dropZone.current.fileInputEl.click();
			}
		}
	}


	handleAccountType = ()=> {
// 		console.log('ProfilePage.handleAccountType()');

		const { profile } = this.props;

		trackEvent('button', 'account-');
		if (profile.paid) {
			this.setState({ confirmDialog : true });

		} else {
			this.props.onStripeModal();
		}
	};


	handleAvatarClick = ()=> {
// 		console.log('ProfilePage.handleAvatarClick()');
		trackEvent('button', 'upload-avatar');

		this.setState({ fileDialog : true }, ()=> this.setState({ fileDialog : false }));
	};

	handleCancel = ()=> {
// 		console.log('ProfilePage.handleCancel()');

		trackEvent('button', 'cancel-changes');
		const { avatar, username, email } = this.props.profile;

		this.setState({ avatar, username, email,
			password      : '',
			passMsg       : '',
			usernameValid : true,
			emailValid    : true,
			changed       : false
		});
	};

	handleDialogComplete = (ok)=> {
// 		console.log('ProfilePage.handleDialogComplete()', ok);

		this.setState({ confirmDialog : false }, ()=> {
			if (ok) {
				const { profile, updateUserProfile, onPopup } = this.props;
				updateUserProfile(Object.assign({}, profile, {
					type : 'free_user'
				}));

				onPopup({
					type    : POPUP_TYPE_OK,
					content : 'Account updated.',
					delay   : 333
				});
			}
		});
	};

	handleDropAvatar = ()=> {
		trackEvent('button', 'drop-avatar');
		this.onValidateFields('avatar', DEFAULT_AVATAR);
	};

	handleFileDialogCancel = ()=> {
		trackEvent('button', 'cancel-dialog');
		this.setState({ fileDialog : false });
	};

	handleFileDrop = (files)=> {
// 		console.log('ProfilePage.handleFileDrop()', files);

		if (files.length > 0) {
			const file = files.pop();
			const { profile } = this.props;

			const config = {
				headers             : { 'content-type' : 'multipart/form-data' },
				onDownloadProgress  : (progressEvent)=> {/* …\(^_^)/… */},
				onUploadProgress    : (progressEvent)=> {
					const { loaded, total } = progressEvent;
					const percent = Math.round((loaded * 100) / total);
					this.setState({ percent });

					if (progressEvent.loaded >= progressEvent.total) {
					}
				}
			};

			const re = /gif|jpe?g|png|svg/;
			if (re.test(Files.extension(file.name))) {
				this.setState({ file });
				trackEvent('button', 'change-avatar');

				let formData = new FormData();
				formData.append('file', file);
				axios.post(`${CDN_UPLOAD_URL}?dir=/profiles&prefix=${profile.id}_`, formData, config)
					.then((response)=> {
						console.log('CDN upload.php', response.data);
						this.onValidateFields('avatar', `http://cdn.designengine.ai/profiles/${profile.id}_${decodeURIComponent(file.name)}`);

					}).catch((error)=> {
					this.props.onPopup({
						type     : POPUP_TYPE_ERROR,
						content  : 'Error uploading image.',
						duration : 3333
					});
				});

			} else {
				this.props.onPopup({
					type     : POPUP_TYPE_ERROR,
					content  : 'Only image files (gif, jpg, png, or svg) are supported.',
					duration : 3333
				});
			}
		}
	};

	handleInputFieldClick = (key)=> {
// 		console.log('ProfilePage.handleInputFieldClick()', key, this.state);

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
			passMsg : (key === 'password') ? val : this.state.passMsg,
			changed : (this.props.profile[key] !== val)
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

		const { avatar, username, email, password, type } = this.state;
		const { usernameValid, emailValid, passwordValid } = this.state;

		if (usernameValid && emailValid && passwordValid) {
			const { id } = this.props.profile;
			this.props.updateUserProfile({ id, avatar, username, email, password, type });
			this.setState({
				passMsg : '',
				changed : false
			});

			this.props.onPopup({
				type    : POPUP_TYPE_OK,
				content : 'Profile updated.',
				delay   : 333
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
		const emailValid = Strings.isEmail(email);
		const passwordValid = true;//(password.length > 0);

// 		console.log(' -=- ProfilePage.onValidateFields()', emailValid, state);

		this.setState({ usernameValid, emailValid, passwordValid,
			username : (usernameValid) ? username : (username.includes('@')) ? 'Usernames Cannot Contain \'@\'' : 'Username Invalid',
			email    : (emailValid) ? email : 'Email Address Invalid',
			passMsg  : (passwordValid) ? password : 'Password Invalid'
		});

		if (usernameValid && emailValid && passwordValid) {
			this.onProfileUpdate();
		}
	};

	render() {
// 		console.log('ProfilePage.render()', this.props, this.state);

		// disable save --  !profile || (profile.avatar === avatar && profile.username === username && profile.email === email && password.length === 0)

// 		const { avatar, username, email } = (this.props.profile) ? this.props.profile : this.state;
		const { profile } = this.props;
		const { avatar, username, email, integrations } = this.state;
		const { passMsg, usernameValid, emailValid, passwordValid, changed, confirmDialog } = this.state;

		return (
			<BaseDesktopPage className="profile-page-wrapper">
				<h4>Profile</h4>
				<div className="profile-page-avatar-wrapper">
					<Row vertical="center">
						<Dropzone className="profile-page-dz-wrapper" multiple={false} disablePreview={true} onDrop={this.handleFileDrop} onFileDialogCancel={this.handleFileDialogCancel} ref={dropZone}>
							<div className="profile-page-avatar-image-wrapper">
								<ImageLoader
									src={avatar}
									image={(props)=> (<img className="profile-page-avatar-image" {...props} src={avatar} alt="" />)}
									loading={()=> (<div className="profile-page-avatar-image profile-page-avatar-image-loading"><FontAwesome name="circle-o-notch" size="2x" pulse fixedWidth /></div>)}
									error={()=> (<div className="profile-page-avatar-image profile-page-avatar-image-error"><FontAwesome name="exclamation-circle" size="2x" /></div>)}
								/>
							</div>
						</Dropzone>
						<button className="adjacent-button" onClick={()=> this.handleAvatarClick()}>{(avatar.includes('avatar-default.png')) ? 'Upload' : 'Replace'}</button>
						<div className={`page-link${(avatar.includes('avatar-default.png')) ? ' page-link-disabled' : ''}`} onClick={()=> this.handleDropAvatar()}>Remove</div>
					</Row>
				</div>

				<div className="profile-page-form-wrapper">
					<InputField
						type="text"
						name="username"
						placeholder="Enter New Username"
						value={username}
						button="Change"
						status={(usernameValid) ? INPUTFIELD_STATUS_IDLE : INPUTFIELD_STATUS_ERROR}
						onChange={(val)=> this.handleInputFieldChange('username', val)}
						onErrorClick={()=> this.handleInputFieldClick('username')}
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
						onErrorClick={()=> this.handleInputFieldClick('email')}
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
						onErrorClick={()=> this.handleInputFieldClick('password')}
						onSubmit={(val)=> this.handleInputFieldSubmit('password', val)}
					/>

					<InputField
						type="lbl"
						name="paid"
						placeholder="Free Account"
						value={(profile && profile.paid) ? 'Unlimited Account' : 'Free Account'}
						button={(profile && profile.paid) ? 'Downgrade' : 'Upgrade'}
						status={INPUTFIELD_STATUS_IDLE}
						onFieldClick={()=> null}
						onSubmit={this.handleAccountType}
					/>
				</div>

				<Row vertical="center">
					<button type="submit" disabled={!changed} className="long-button adjacent-button" onClick={()=> this.handleSubmit()}>Save</button>
					{(changed) && (<div className="page-link" onClick={()=> this.handleCancel()}>Cancel</div>)}
				</Row>

				{(profile) && (<ProfilePageIntegrationsGrid
					title="Design Tools & Frameworks Integrations"
					items={integrations}
					profile={profile}
					onClick={this.props.onIntegrations}
				/>)}

				{(confirmDialog) && (<ConfirmDialog
					title="Change Account"
					message="Are you sure you want to downgrade to a Free Account?"
					onComplete={this.handleDialogComplete}
				/>)}
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
