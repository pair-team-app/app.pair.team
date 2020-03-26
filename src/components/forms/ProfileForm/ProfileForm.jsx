
import React, { Component } from 'react';
import './ProfileForm.css';


import { Bits, Strings } from 'lang-js-utils';
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
			changed       : false,
			validated     : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot);

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
				passwordValid : passwordValid,
				validated     : true
			}, ()=> {
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
		const { emailValid, changed, validated } = this.state;

		return (
			<div className="profile-form">
				<form onSubmit={this.handleSubmit}>
					<input name="email" style={{ display : 'none' }} />
					<input type="password" name="password" style={{ display : 'none' }} />

					{(validated)
						? (<div className="form-acc-wrapper">
								<input type="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, validated : false })} onChange={this.handleEmailChange} autoComplete="new-password" required />
              	{/* <div className="form-accessory" onClick={this.props.onDowngradePlan}>Change</div> */}
						</div>)
						: (<div className="form-acc-wrapper">
								<input type="text" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, validated : false })} onChange={this.handleEmailChange} autoComplete="new-password" />
              	{/* <div className="form-accessory" onClick={this.props.onDowngradePlan}>Change</div> */}
						</div>)
					}
          <div className="form-acc-wrapper">
						<input type="password" placeholder="Enter Password" value={password} onChange={this.handlePasswordChange} onClick={this.handlePasswordClick} autoComplete="new-password" />
            {/* <div className="form-accessory" onClick={this.props.onDowngradePlan}>Change</div> */}
					</div>

					<div className="button-wrapper-col stripe-form-button-wrapper">
            <button disabled={!changed || email.length === 0 || !emailValid} type="submit" onClick={this.handleSubmit}>Submit</button>
						{/*<button disabled={(email.length === 0 || !emailValid || !passwordValid)} type="submit" onClick={this.handleSubmit}>Update</button>*/}
					</div>
				</form>
			</div>
		);
	}
}

export default ProfileForm;
