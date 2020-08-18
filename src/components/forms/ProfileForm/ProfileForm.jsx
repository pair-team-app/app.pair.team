
import React, { Component } from 'react';
import './ProfileForm.css';

import { Bits, Strings } from 'lang-js-utils';
import md5 from 'md5';

import DummyForm from '../DummyForm';
import { trackEvent } from '../../../utils/tracking';
import { makeAvatar } from '../../../utils/funcs';

class ProfileForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email         : (props.profile.email),
			password      : '',
			newPassword   : '',
			newPassword2  : '',
			emailValid    : true,
			passwordValid : true,
			passMsg       : null,
			changed       : false,
			validated     : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);

		const { profile } = this.props;
		const { email, password, status } = profile;
		const { validated } = this.state;

		const changed = (this.state.email !== email || this.state.password !== password);
		if (changed !== this.state.changed) {
			this.setState({ changed });
		}

		if (profile !== prevProps.profile && status !== 0x00 && validated) {
			this.setState({ email, password,
				emailValid : !Bits.contains(status, 0x10),
				changed    : false
			});
		}
	}

	handleEmailChange = (event)=> {
// console.log('%s.handleEmailChange()', this.constructor.name, { event });
		this.setState({
			email   : event.target.value,
			changed : true
		});
	};

	handlePasswordClick = (event)=> {
// console.log('%s.handlePasswordClick()', this.constructor.name, { event });
		event.preventDefault();

    const { password, newPassword, newPassword2, passwordValid } = this.state;
		this.setState({
			password      : (passwordValid) ? password : '',
			newPassword   : (newPassword === 'Passwords don\'t match') ? '' : newPassword,
			passwordValid : true,
			passMsg       : null,
      changed       : false,
      validated     : false
		});
	};

	handleSubmit = (event)=> {
    console.log('%s.handleSubmit()', this.constructor.name, { event, props : this.props, state : this.state });

    event.preventDefault();

		const { profile } = this.props;
		const { email, password, newPassword, newPassword2, changed } = this.state;
		if (changed) {
      const emailValid = Strings.isEmail(email);
      const passwordValid = (md5(password) === profile.password);

      if (emailValid && passwordValid && (newPassword === newPassword2)) {
        trackEvent('button', 'profile-update');

        const { id } = profile;
        const avatar = (!Strings.compare(Strings.firstChar(email), Strings.firstChar(profile.email), false)) ? makeAvatar(email) : profile.avatar;

        this.props.onSubmit({ id, email, avatar,
          username : email,
          password : newPassword
        });

      } else {
        this.setState({
          email         : (emailValid) ? email : 'Email Address or Username Invalid',
          passMsg       : (passwordValid) ? '' : 'Password Invalid',
          newPassword   : (newPassword === newPassword2) ? newPassword : 'Passwords don\'t match',
          newPassword2  : (newPassword === newPassword2) ? newPassword2 : '',
          emailValid    : emailValid,
          passwordValid : passwordValid,
          validated     : true
        });
      }
		}
	};


	render() {
// console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { email, password, newPassword, newPassword2, passMsg } = this.state;
		const { emailValid, passwordValid, changed, validated } = this.state;

		return (
			<div className="profile-form">
				<form onSubmit={this.handleSubmit}>
          <DummyForm />
					<input type={(validated) ? 'email' : 'text'} placeholder="Change Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, validated : false })} onChange={this.handleEmailChange} autoComplete="new-password" required={(validated)} />
					<input type={(passMsg) ? 'email' : 'password'} placeholder="Current Password" value={(passMsg || password)} onChange={(event)=> this.setState({ password : event.target.value, passMsg : null })} onClick={this.handlePasswordClick} autoComplete="new-password" />
					<input type={(validated && newPassword !== newPassword2) ? 'email' : 'password'} placeholder="New Password" value={newPassword} onChange={(event)=> this.setState({ newPassword : event.target.value, passMsg : null })} onClick={this.handlePasswordClick} autoComplete="new-password" required={(validated)} />
					<input type="password" placeholder="Confirm New Password" value={newPassword2} onChange={(event)=> this.setState({ newPassword2 : event.target.value, passMsg : null })} onClick={this.handlePasswordClick} autoComplete="new-password" />


					<div className="button-wrapper button-wrapper-row">
            <button type="submit" disabled={!changed || email.length === 0 || !emailValid || !passwordValid || (newPassword.length > 0 && newPassword !== newPassword2)} onClick={(event)=> this.handleSubmit(event)}>Submit</button>
						<button className="cancel-button" onClick={this.props.onCancel}>Cancel</button>
						{/*<button disabled={(email.length === 0 || !emailValid || !passwordValid)} type="submit" onClick={this.handleSubmit}>Update</button>*/}
					</div>
				</form>
			</div>
		);
	}
}

export default ProfileForm;
