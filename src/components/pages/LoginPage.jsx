
import React, { Component } from 'react';
import './LoginPage.css';

import cookie from 'react-cookies';
import { connect } from 'react-redux';

import LoginForm from '../elements/LoginForm';
import { updateUserProfile } from '../../redux/actions';


const mapDispatchToProps = (dispatch)=> {
	return ({
		updateUserProfile : (profile)=> dispatch(updateUserProfile(profile))
	});
};


class LoginPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email         : '',
			password      : '',
			emailValid    : true,
			passwordValid : true,
			passMsg       : ''
		};
	}

	handleLoggedIn = (profile)=> {
		console.log('LoginPage.handleLoggedIn()', profile);

		const { id, username, email, avatar, password } = profile;
		cookie.save('user_id', id, { path : '/' });
		this.props.updateUserProfile({ id, avatar, username, email, password });
		this.props.onPage('');
	};

	render() {
		const title = (typeof cookie.load('msg') === 'undefined') ? 'Login' : 'You must be signed in to ' + cookie.load('msg');

		if (typeof cookie.load('msg') !== 'undefined') {
			cookie.remove('msg');
		}

		return (
			<div className="page-wrapper login-page-wrapper">
				<h3>{title}</h3>
				<h4>Enter the email address of each member of your team to invite them to this project.</h4>
				<LoginForm onLoggedIn={this.handleLoggedIn} onPage={this.props.onPage} />
			</div>
		);
	}
}

export default connect(null, mapDispatchToProps)(LoginPage);
