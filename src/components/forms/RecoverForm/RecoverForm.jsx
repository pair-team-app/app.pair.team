
import React, { Component } from 'react';
import './RecoverForm.css'

import axios from 'axios';
import { Strings } from 'lang-js-utils';

import DummyForm from '../../forms/DummyForm';
import { API_ENDPT_URL } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';


class RecoverForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email      : '',
			emailValid : true,
			validated  : false
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

		const { submitted } = this.props;
		const { email } = this.state;

		if (submitted && (email !== prevState.email)) {
			this.props.onResend();
		}
	}

	handleSubmit = (event)=> {
		// console.log('%s.handleSubmit()', this.constructor.name, event.target, this.state);

		event.preventDefault();

		trackEvent('button', 'recover');

		const { email } = this.state;
		const emailValid = Strings.isEmail(email);

		console.log('%s.handleSubmit()', this.constructor.name, { email, emailValid });

		if (emailValid) {
			const username = email;

			axios.post(API_ENDPT_URL, {
				action  : 'RECOVER',
				payload : { email, username }
			}).then((response)=> {
				console.log('RECOVER', response.data);
				this.props.onSubmitted();

			}).catch((error)=> {});

		} else {
			this.setState({
				email     : 'Email Address Invalid',
				validated : true
			});

		}
	};


	render() {
console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { submitted } = this.props;
		const { email, emailValid, validated } = this.state;

		return (<div className="recover-form">
			<form onSubmit={this.handleSubmit}>
				<DummyForm />
				{(validated)
					? (<input type="email" placeholder="Enter Work Email Address" value={email} onFocus={()=> this.setState({ email : '', emailValid : true, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" autoFocus />)
					: (<input type="text" placeholder="Enter Work Email Address" value={email} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" />)
				}

        <div className="button-wrapper button-wrapper-row">
          <button type="submit" disabled={(email.length === 0 || !emailValid)} onClick={this.handleSubmit}>{(submitted) ? 'Resend' : 'Submit'}</button>
          <button type="button" className="cancel-button" onClick={this.props.onCancel}>Cancel</button>
        </div>
				{/* <button disabled={(email.length === 0 || !emailValid)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Submit</button> */}
			</form>
		</div>);
	}
}





export default (RecoverForm);
