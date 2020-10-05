
import React, { Component } from 'react';
import './RegisterForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';

import DummyForm from '../../forms/DummyForm';
import { API_ENDPT_URL } from '../../../consts/uris';
import { makeAvatar } from '../../../utils/funcs';
// import blacklistTeamDomains from '../../../assets/json/configs/blacklist-team-domains.json';

class RegisterForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email         : (props.invite) ? props.invite.email : '',
			password      : '',
			password2     : '',
			passMsg       : null,
			emailValid    : true,
			passwordValid : true,
			validated     : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

		if (prevProps.email !== this.props.email) {
			const { email } = this.props;
			this.setState({ email });
		}
	}

	handlePassword = ()=> {
		console.log('%s.handlePassword()', this.constructor.name);

		this.setState({
			password      : '',
			password2     : '',
			passwordValid : true,
			passMsg       : null
		});
	};

	handleSubmit = (event)=> {
		console.log('%s.handleSubmit()', this.constructor.name, event.target);
		event.preventDefault();

		const { invite } = this.props;
		const { email, password, password2 } = this.state;

		const emailValid = Strings.isEmail(email);
		const emailBlackListed = false; //(blacklistTeamDomains.matches.filter((patt)=> ((new RegExp(`${patt}`, 'i')).test(email))).length > 0);
		const passwordValid = (password.length > 0 && password === password2);

		this.setState({ emailValid, passwordValid,
			email         : (emailValid) ? (emailBlackListed) ? `@${email.split('@').pop()} not supported` : email : 'Email Address Invalid',
			passMsg       : (passwordValid) ? '' : 'Passwords don\'t match'
		});


		console.log('%s.handleSubmit()', this.constructor.name, { props : this.props, state : this.state, email, emailValid, passwordValid, emailBlackListed });


		if (emailValid && passwordValid && !emailBlackListed) {
			axios.post(API_ENDPT_URL, {
				action  : 'REGISTER',
				payload : { email, password,
					username  : email,
					types     : ['user', (invite) ? 'invite' : 'signup', 'site'],
					avatar    : makeAvatar(email),
					invite_id : (invite) ? invite.id : null
				}
			}).then((response)=> {
        console.log('REGISTER', response.data);
        const { user } = response.data;
				const status = parseInt(response.data.status, 16);
				// console.log('status', status, Bits.contains(status, 0x01), Bits.contains(status, 0x10));

				if (status === 0x11) {
					this.props.onRegistered({ ...user, password});

				} else {
					this.setState({
						validated  : true,
						email      : Bits.contains(status, 0x01) ? email : 'Email Address Already in Use',
						password   : '',
						password2  : '',
						emailValid : Bits.contains(status, 0x01)
					});
				}
			}).catch((error)=> {
				console.log('REGISTER -- ERROR', { error : error.config.data });
			});

		} else {
			this.setState({ validated : true });
		}
	};


	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { invite } = this.props;
		const { email, password, password2, passMsg } = this.state;
		const { emailValid, passwordValid, validated } = this.state;

		return (
			<div className="register-form">
				<form onSubmit={this.handleSubmit}>
					<DummyForm />

					{(validated)
						? (<input type="email" disabled={(invite !== null)} placeholder="Enter Work Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" required autoFocus />)
						: (<input type="text" disabled={(invite !== null)} placeholder="Enter Work Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" />)
					}

					{(passMsg)
						? (<input type="email" placeholder="Enter Password" value={passMsg} onFocus={()=> this.setState({ passMsg : null })} onChange={(event)=> this.setState({ password : event.target.value, passMsg : null })} onClick={this.handlePassword} autoComplete="new-password" required />)
						: (<input type="password" placeholder="Enter Password" value={password} onChange={(event)=> this.setState({ password : event.target.value, passMsg : null })} onClick={this.handlePassword} autoComplete="new-password" />)
					}

					{(passMsg)
						? (<input type="email" placeholder="Confirm Password" value={passMsg} onChange={(event)=> this.setState({ password2 : event.target.value })} autoComplete="off" required />)
						: (<input type="password" placeholder="Confirm Password" value={password2} onChange={(event)=> this.setState({ password2 : event.target.value })} autoComplete="off" />)
					}
          <div className="button-wrapper button-wrapper-row">
					  <button type="submit" disabled={(email.length === 0 || password.length === 0 || password2.length === 0 || !emailValid || !passwordValid || password !== password2)} onClick={(event)=> this.handleSubmit(event)}>Submit</button>
            <button type="button" className="cancel-button" onClick={this.props.onCancel}>Cancel</button>
          </div>
				</form>
			</div>
		);
	}
}

export default RegisterForm;
