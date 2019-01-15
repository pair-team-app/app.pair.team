
import React, { Component } from 'react';
import './RegisterPage.css';

import cookie from 'react-cookies';
import { connect } from 'react-redux';

import RegisterForm from '../forms/RegisterForm';
import { updateUserProfile } from '../../redux/actions';
import { trackEvent } from '../../utils/tracking';


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


class RegisterPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('RegisterPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	handleRegistered = (profile)=> {
		console.log('RegisterPage.handleRegistered()', profile);
		trackEvent('user', 'sign-up');
		cookie.save('user_id', profile.id, { path : '/' });
		this.props.updateUserProfile(profile);
		this.props.onPage((this.props.redirectURL) ? this.props.redirectURL.substr(1) : '');
	};

	render() {
// 		console.log('RegisterPage.render()', this.props, this.state);

		return (
			<div className="page-wrapper register-page-wrapper">
				<h3>Sign Up for Design Engine</h3>
				Enter Username, Email, & Password to Sign Up for Design Engine.
				<RegisterForm onRegistered={this.handleRegistered} onLogin={()=> this.props.onPage('login')} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
