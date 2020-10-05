
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
	}

	handleSubmit = (event)=> {
		console.log('%s.handleSubmit()', this.constructor.name, event.target, this.state);

		event.preventDefault();

		trackEvent('button', 'recover');

		const { email } = this.state;
		const emailValid = (email.includes('@')) ? Strings.isEmail(email) : (email.length > 0);

		this.setState({
			email      : (emailValid) ? email : 'Email Address Invalid',
			emailValid : emailValid,
		});

		if (emailValid) {
			const username = email;

			axios.post(API_ENDPT_URL, {
				action  : 'RECOVER',
				payload : { email, username }
			}).then((response)=> {
				console.log('RECOVER', response.data);

        this.props.onSubmitted();
			}).catch((error)=> {
			});

		} else {
			this.setState({ validated : true });
		}
	};


	render() {
// console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { email } = this.state;
		const { emailValid, validated } = this.state;

		return (<div className="recover-form">
			<form onSubmit={this.handleSubmit}>
				<DummyForm />
				{(validated)
					? (<input type="email" placeholder="Enter Work Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, passMsg : null, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" autoFocus />)
					: (<input type="text" placeholder="Enter Work Email Address" value={email} onFocus={()=> this.setState({ email : (emailValid) ? email : '', emailValid : true, passMsg : null, validated : false })} onChange={(event)=> this.setState({ email : event.target.value })} autoComplete="new-password" />)
				}

        <div className="button-wrapper button-wrapper-row">
          <button type="submit" disabled={(email.length === 0 || !emailValid)} onClick={this.handleSubmit}>Submit</button>
          <button type="button" className="cancel-button" onClick={this.props.onCancel}>Cancel</button>
        </div>
				{/* <button disabled={(email.length === 0 || !emailValid)} type="submit" onClick={(event)=> this.handleSubmit(event)}>Submit</button> */}
			</form>
		</div>);
	}
}





export default (RecoverForm);
