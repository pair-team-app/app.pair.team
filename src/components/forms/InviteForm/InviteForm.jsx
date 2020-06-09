
import React, { Component } from 'react';
import './InviteForm.css'

import axios from 'axios';
import { Bits, Strings } from 'lang-js-utils';

import DummyForm from '../../forms/DummyForm';
import { API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


class InviteForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inviteID    : props.inviteID,
			emails      : new Array(5).fill(''),
			emailsValid : new Array(5).fill(true),
			validations : new Array(5).fill(false)
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state);
	}

	handleSubmit = (event)=> {
		console.log('%s.handleSubmit()', this.constructor.name, event.target, this.state);
		event.preventDefault();

		trackEvent('button', 'team-invite');

		const { profile, team } = this.props
		const { emails, validations } = this.state;
		// const emailsValid = emails.reduce((acc, val)=> (acc * ((val.includes('@')) ? Strings.isEmail(val) : (val.length > 0))), 1);
		const emailsValid = emails.map((email)=> (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0));

		this.setState({ emailsValid,
			emails : emails.map((email, i)=> ((emailsValid[i]) ? email : 'Email Address Invalid '))
		});

		if (emailsValid.filter((valid)=> (valid)).length > 0) {
			axios.post(API_ENDPT_URL, {
				action  : 'TEAM_INVITE',
				payload : {
					team_id : team.id,
					user_id : profile.id,
					emails  : emailsValid.map((valid, i)=> ((valid) ? emails[i] : null)).filter((email)=> (email !== null))
				}
			}).then((response)=> {
				const { invites } = response.data;
				// const status = parseInt(response.data.status, 16);
				console.log('TEAM_INVITE', { invites });

				// if (user) {
					// this.props.onLoggedIn(user);

				// } else {
				// 	this.setState({
				// 		validated     : true,
				// 		email         : (Bits.contains(status, 0x01)) ? email : 'Email Address Incorrect',
				// 		password      : '',
				// 		emailValid    : Bits.contains(status, 0x01),
				// 		passwordValid : Bits.contains(status, 0x10),
				// 		passMsg       : (Bits.contains(status, 0x10) || !Bits.contains(status, 0x01)) ? '' : 'Password Incorrect'
				// 	});
				// }

			}).catch((error)=> {
			});

		} else {
			this.setState({ validations : new Array(5).fill(true) });
		}
	};

	handleTextFocus = (event, i)=> {
		console.log('%s.handleTextFocus()', this.constructor.name, { event, i, state : this.state });


		const { emails, emailsValid, validations } = this.state;
		this.setState({
			emails      : emails.map((email, ii)=> ((ii === i || emailsValid[ii]) ? email : '')),
			emailsValid : emailsValid.map((valid, ii)=> ((ii === i) ? true : valid)),
			validations : validations.map((valid, ii)=> ((ii === i) ? true : valid ))
		});
	};

	handleTextChange = (event, i)=> {
		console.log('%s.handleTextChange()', this.constructor.name, { event, i, state : this.state });

	const { emails } = this.state;
		this.setState({  emails : emails.map((email, ii)=> ((ii === i) ? event.target.value : email)) });
	};


	render() {
// console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { profile, team } = this.props;
		const { emails, emailsValid, validations } = this.state;

		return (<div className="invite-form">
			<form onSubmit={this.handleSubmit}>
				<DummyForm />
				{(emails.map((email, i)=> {
					return ((validations[i])
					? (<input key={i} type="email" placeholder="Enter Email Address" value={email} onFocus={(event)=> this.handleTextFocus(event, i)} onChange={(event)=> this.handleTextChange(event, i)} autoComplete="new-password" autoFocus />)
					: (<input key={i} type="text" placeholder="Enter Email Address" value={email} onFocus={(event)=> this.handleTextFocus(event, i)} onChange={(event)=> this.handleTextChange(event, i)} autoComplete="new-password" />));
				}))}

				<button disabled={(emails.filter((email)=> (email.length === 0)).length === emails.length || emailsValid.filter((valid)=> (!valid)).length === emailsValid.length)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Invite Team</button>
			</form>
		</div>);
	}
}

export default InviteForm;
