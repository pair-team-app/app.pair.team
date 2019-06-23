
import React, { Component } from 'react';
import './AccountPage.css';

import axios from 'axios/index';
import { connect } from 'react-redux';

import BasePage from '../BasePage';
import PageHeader from '../../sections/PageHeader';
import { API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


const ConfirmEmail = (props)=> {
	console.log('AccountPage.ConfirmEmail()', props);

	return (<div className="confirm-email">
		<PageHeader title="Check your email to complete your sign up">
			<button className="long-button" onClick={props.onTwitter}>Mention on Twitter</button>
		</PageHeader>
	</div>);
};

const RegisterUser = (props)=> {
	console.log('AccountPage.RegisterUser()', props);

	const { username, usernameValid, company, password, passwordValid } = props;

	return (<div className="register-user">
		<PageHeader title="Complete your sign up">
			<form onSubmit={props.onSubmit}>
				<div className={`input-wrapper${(!usernameValid) ? ' input-wrapper-error' : ''}`}><input type="text" name="username" placeholder="Name" value={username} onFocus={props.onUsernameFocus} onChange={props.onUsernameChange} /></div>
				<div className="input-wrapper"><input type="text" name="company" placeholder="Company" value={company} onFocus={props.onCompanyFocus} onChange={props.onCompanyChange} /></div>
				<div className={`input-wrapper${(!passwordValid) ? ' input-wrapper-error' : ''}`}><input type="password" name="password" placeholder="Password" value={password} onFocus={props.onPasswordFocus} onChange={props.onPasswordChange} /></div>
				<button disabled={(username.length === 0 || password.length === 0)} type="submit" className="long-button" onClick={(event)=> props.onSubmit(event)}>Sign Up</button>
			</form>
			<h5>By tapping “Sign Up” or “Login” you accept our Terms of Service.</h5>
		</PageHeader>
	</div>);
};


class AccountPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			username      : '',
			usernameValid : true,
			company       : '',
			password      : '',
			passwordValid : true

		};

		this.twitterWindow = null;
	}

	componentDidMount() {
		console.log('AccountPage.componentDidMount()', this.props, this.state);
		//this.props.match.params.userID
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('AccountPage.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	handleTwitter = ()=> {
		console.log('AccountPage.render()', this.props, this.state);
		const size = {
			width  : Math.min(320, window.screen.width - 20),
			height : Math.min(280, window.screen.height - 25)
		};

		this.twitterWindow = window.open('https://twitter.com/intent/tweet?via=DesignEngine', '', `titlebar=no, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${size.width}, height=${size.height}, top=${((((window.screen.height) - size.height) * 0.5) << 0)}, left=${((((window.screen.width) - size.width) * 0.5) << 0)}`);
	};

	render() {
// 		console.log('AccountPage.render()', this.props, this.state);

		const { section } = this.props.match.params;
		const { username, usernameValid, company, passMsg, passwordValid } = this.state;

		return (
			<BasePage className="account-page-wrapper">
				{(section === 'confirm') && (<ConfirmEmail
					onTwitter={this.handleTwitter}
				/>)}

				{(section === 'register') && (<RegisterUser
					username={username}
					usernameValid={usernameValid}
					comapany={company}
					password={passMsg}
					passwordValid={passwordValid}
				/>)}
			</BasePage>
		);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile
	});
};


export default connect(mapStateToProps)(AccountPage);
