
import React, { Component } from 'react';
import './LoginPage.css';

import cookie from 'react-cookies';
import { connect } from 'react-redux';

import LoginForm from '../elements/LoginForm';
import { updateUserProfile } from '../../redux/actions';


const mapStateToProps = (state, ownProps)=> {
	return ({
		redirectURL : state.redirectURL
	});
};

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

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('LoginPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	handleLoggedIn = (profile)=> {
		console.log('LoginPage.handleLoggedIn()', profile, this.props);

		const { id, username, email, avatar, password } = profile;
		cookie.save('user_id', id, { path : '/' });
		this.props.updateUserProfile({ id, avatar, username, email, password });
		this.props.onPage((this.props.redirectURL) ? this.props.redirectURL.substr(1) : '');
	};

	render() {
		console.log('LoginPage.render()', this.props, this.state);

		const title = (typeof cookie.load('msg') === 'undefined') ? 'Login' : 'You must be signed in to ' + cookie.load('msg');

		if (typeof cookie.load('msg') !== 'undefined') {
			cookie.remove('msg');
		}

		return (
			<div className="page-wrapper login-page-wrapper">
				<h3>Login to Design Engine</h3>
				<h4>Enter Username or Email & Password to Login to Design Engine.</h4>
				<LoginForm onLoggedIn={this.handleLoggedIn} onPage={this.props.onPage} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
