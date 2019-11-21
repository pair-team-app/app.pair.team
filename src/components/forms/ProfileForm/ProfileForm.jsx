
import React, { Component } from 'react';
import './ProfileForm.css';


import { Strings } from 'lang-js-utils';
import { trackEvent } from '../../../utils/tracking';


class ProfileForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email         : (props.profile.email),
			password      : '',
			team          : props.team,
			emailValid    : true,
			passwordValid : true,
			passMsg       : '',
			changed       : false,
		};

		this.passwordTextfield = React.createRef();
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.passwordTextfield = null;
	}

	handlePassword = (event)=> {
// 		console.log('%s.handlePassword()', this.constructor.name);
		event.preventDefault();

		this.setState({
			password      : '',
			passwordValid : true,
			passMsg       : ''
		});

		setTimeout(()=> {
			this.passwordTextfield.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
		console.log('%s.handleSubmit()', this.constructor.name, event, this.state);
		event.preventDefault();

		trackEvent('button', 'update-profile');

		const { email, password } = this.state;
// 		const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0);
		const emailValid = Strings.isEmail(email);
		const passwordValid = true;//(password.length > 0);

		this.setState({
			email         : (emailValid) ? email : 'Email Address or Username Invalid',
			passMsg       : (passwordValid) ? '' : 'Password Invalid',
			emailValid    : emailValid,
			passwordValid : passwordValid
		}, ()=> {
			if (emailValid && passwordValid) {
				const { id, username } = this.props.profile;
				this.props.onSubmit({ id, username, email, password });

			}
		});
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { email, password, team } = this.state;
		const { emailValid, passwordValid } = this.state;

		return (
			<div className="profile-form">
				<form onSubmit={this.handleSubmit}>
					<input name="email" style={{ display : 'none' }} />
					<input type="password" name="password" style={{ display : 'none' }} />

					<input type="text" placeholder="Enter Email Address" value={email} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" />
					<input type="text" className="profile-form-team-txt" value={Strings.capitalize(team.type)} name="team-plan" readOnly={true} />
					<input type="password" placeholder="Enter Password" value={password} onChange={(event)=> this.setState({ password : event.target.value })} onClick={this.handlePassword} ref={(element)=> { this.passwordTextfield = element }} autoComplete="new-password" />

					<div className="button-wrapper-col stripe-form-button-wrapper">
						<button onClick={this.handleCancel}>Cancel</button>
						<button disabled={(email.length === 0 || !emailValid || !passwordValid)} type="submit" onClick={this.handleSubmit}>Update</button>
					</div>
				</form>
			</div>
		);
	}
}

export default ProfileForm;
