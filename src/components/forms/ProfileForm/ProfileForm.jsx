
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
			emailValid    : true,
			passwordValid : true,
			passMsg       : '',
			changed       : false
		};

		this.passwordTextfield = React.createRef();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);

		const { email, password } = this.props.profile;
		const changed = (this.state.email !== email || this.state.password !== password);

		if (changed !== this.state.changed) {
			this.setState({ changed });
		}
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.passwordTextfield = null;
	}

	handleEmailChange = (event)=> {
// 		console.log('%s.handleEmailChange()', this.constructor.name, event);
		this.setState({
			email   : event.target.value,
			changed : true
		});
	};

	handlePasswordChange = (event)=> {
// 		console.log('%s.handlePasswordChange()', this.constructor.name, event);

		this.setState({
			password : event.target.value,
			passMsg  : '',
			changed  : true
		});
	};

	handlePasswordClick = (event)=> {
// 		console.log('%s.handlePasswordClick()', this.constructor.name, event);
		event.preventDefault();

		this.setState({
			password      : '',
			passwordValid : true,
			passMsg       : '',
			changed       : false
		});

		setTimeout(()=> {
			this.passwordTextfield.focus();
		}, 69);
	};

	handleSubmit = (event)=> {
// 		console.log('%s.handleSubmit()', this.constructor.name, event, this.state);
		event.preventDefault();

		const { email, password, changed } = this.state;
		if (changed) {
			trackEvent('button', 'profile-update');

			// 		const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0);
			const emailValid = Strings.isEmail(email);
			const passwordValid = true;//(password.length > 0);

			this.setState({
				email         : (emailValid) ? email : 'Email Address or Username Invalid',
				passMsg       : (passwordValid) ? '' : 'Password Invalid',
				emailValid    : emailValid,
				passwordValid : passwordValid
			}, () => {
				if (emailValid && passwordValid) {
					const { id, username } = this.props.profile;
					this.props.onSubmit({ id, username, email, password });
				}
			});
		}
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { team } = this.props;
		const { email, password } = this.state;
// 		const { emailValid, passwordValid } = this.state;
		const { emailValid, changed } = this.state;

		return (
			<div className="profile-form">
				<form onSubmit={this.handleSubmit}>
					<input name="email" style={{ display : 'none' }} />
					<input type="password" name="password" style={{ display : 'none' }} />

					<input type="text" placeholder="Enter Email Address" value={email} onChange={this.handleEmailChange} autoComplete="new-password" />
					{(team.type === 'free')
						? (<input type="text" className="profile-form-team-txt" value={Strings.capitalize(team.type)} name="team-plan" readOnly={true} />)
						: (<div className="profile-form-team-wrapper">
							<input type="text" className="profile-form-team-txt" value={Strings.capitalize(team.type)} name="team-plan" readOnly={true} />
							<div className="form-accessory-txt" onClick={this.props.onDowngradePlan}>Downgrade</div>
						</div>)
					}
					<input type="password" placeholder="Enter Password" value={password} onChange={this.handlePasswordChange} onClick={this.handlePasswordClick} ref={(element)=> { this.passwordTextfield = element }} autoComplete="new-password" />

					<div className="button-wrapper-col stripe-form-button-wrapper">
						<button onClick={this.props.onCancel}>Cancel</button>
						{/*<button disabled={(email.length === 0 || !emailValid || !passwordValid)} type="submit" onClick={this.handleSubmit}>Update</button>*/}
						<button disabled={!changed || email.length === 0 || !emailValid} type="submit" onClick={this.handleSubmit}>Update</button>
					</div>
				</form>
			</div>
		);
	}
}

export default ProfileForm;
