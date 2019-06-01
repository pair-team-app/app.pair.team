
import React, { Component } from 'react';
import './SignupPage.css';

import axios from 'axios';
import qs from 'qs';
import cookie from 'react-cookies';
import { connect } from 'react-redux';
import { Row } from 'simple-flexbox';

import BaseDesktopPage from '../BaseDesktopPage';
import { API_ENDPT_URL } from '../../../../consts/uris';
import { updateUserProfile } from '../../../../redux/actions';
import { Strings } from '../../../../utils/lang';
import { trackEvent } from '../../../../utils/tracking';
import editor from '../../../../assets/images/elements/element-editor.gif';
import deLogo from '../../../../assets/images/logos/logo-designengine.svg';



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


const SignupPageHeader = (props)=> {
// 	console.log('SignupPage.SignupPageHeader()', props);

	return (<div className="signup-page-header">
		<img className="signup-page-header-logo" src={deLogo} alt="Logo" />
		<h1 className="page-header-title upload-header-title">The first Design Tool for Engineers</h1>
		<h3 className="page-header-subtitle upload-header-subtitle">A Simple Text Editor that brings design next to front-end coding.</h3>
	</div>);
};

const SignupPageForm = (props)=> {
// 	console.log('SignupPage.SignupPageForm()', props);

	const { email, emailValid } = props;
	const emailClass = `input-wrapper${(emailValid) ? '' : ' input-wrapper-error'} adjacent-button`;

	return (<div className="signup-page-form"><Row horizontal="center">
		<form onSubmit={props.onSubmit}><Row horizontal="center">
			<div className={emailClass}><input type="text" name="email" placeholder="Enter Email" value={email} onFocus={props.onFocus} onChange={props.onChange} /></div>
			<button disabled={(email.length === 0 || !Strings.isEmail(email))} className="long-button" type="submit" onClick={props.onSubmit}>Request Access</button>
		</Row></form>
	</Row></div>);
};


class SignupPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			submitted  : false,
			email      : '',
			emailValid : true
		};
	}

	handleSubmit = (event)=> {
		console.log('SignupPage.handleSubmit()', event);

		event.preventDefault();
		trackEvent('button', 'request-access');

		const { email, emailValid } = this.state;
		if (emailValid) {
			axios.post(API_ENDPT_URL, qs.stringify({
				action : 'ACCESS_SIGNUP',
				email  : email,
			})).then((response) => {
				console.log('ACCESS_SIGNUP', response.data);
				const status = parseInt(response.data.status, 16);

				if (status === 0x11) {
					this.setState({
						email     : '',
						submitted : true
					});
					cookie.save('user_id', response.data.user.id, { path : '/' });
					this.props.updateUserProfile(response.data.user);

				} else {
					this.setState({
						email      : 'Email Address Already in Use',
						emailValid : false
					});
				}
			}).catch((error)=> {
			});
		}
	};


	render() {
// 		console.log('IntegrationsPage.render()', this.props, this.state);

		const { email, emailValid, submitted } = this.state;
		return (
			<BaseDesktopPage className="signup-page-wrapper">
				<Row className="signup-page-header-wrapper" horizontal="center" vertical="center"><div>
					<SignupPageHeader />
					<SignupPageForm
						email={email}
						emailValid={emailValid}
						onFocus={()=> this.setState({ email : '', emailValid : true })}
						onChange={(event)=> this.setState({ [event.target.name] : event.target.value })}
						onSubmit={(event)=> this.handleSubmit(event)}
					/>
					<div className="signup-page-form-submitted" style={{opacity:`${submitted << 0}`}}>
						Thank you, you will be notified when your spot is ready.
					</div>
				</div></Row>

				<div className="signup-page-image-wrapper">
					<img className="signup-page-image" src={editor} alt="Screenshot" />
				</div>
			</BaseDesktopPage>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupPage);