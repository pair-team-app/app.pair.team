
import React, { Component } from 'react';
import './RegisterPage.css';

import cookie from "react-cookies";
import { connect } from 'react-redux';

import RegisterForm from '../elements/RegisterForm';
import { updateUserProfile } from '../../redux/actions';
import { trackEvent } from '../../utils/tracking';


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


class RegisterPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleRegistered = (profile)=> {
		console.log('RegisterPage.handleRegistered()', profile);
		trackEvent('user', 'sign-up');
		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);
		this.props.onPage('');
	};

	render() {
		console.log('RegisterPage.render()', this.props, this.state);

		return (
			<div className="page-wrapper register-page-wrapper">
				<h3>Sign Up</h3>
				Enter registration details to submit design file.
				<RegisterForm onPage={this.props.onPage} onRegistered={this.handleRegistered} />
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(RegisterPage);
