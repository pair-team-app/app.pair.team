
import React, { Component } from 'react';
import './RecoverPage.css';

import axios from "axios/index";
import { Column, Row } from 'simple-flexbox';

class RecoverPage extends Component {
	constructor(props) {
		super(props);

		this.state = {
			action        : '',
			email         : '',
			emailValid    : false,
			errorMsg      : ''
		};
	}

	handleSubmit = (event)=> {
		console.log('submit()');
		event.preventDefault();

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const email = this.state.email;

		const isEmailValid = re.test(String(email).toLowerCase());
		this.setState({
			action     : 'RECOVER',
			emailValid : isEmailValid
		});

		if (isEmailValid) {
			let formData = new FormData();
			formData.append('action', 'RESET_PASSWORD');
			formData.append('email', email);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response)=> {
					console.log('RESET_PASSWORD', response.data);
				}).catch((error) => {
			});

			this.props.onPage('');
		}
	};


	render() {
		const { action, emailValid, errorMsg } = this.state;
		const { email } = this.state;

		const emailClass = (action === '') ? 'input-wrapper' : (action === 'RECOVER' && !emailValid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		return (
			<div className="page-wrapper recover-page-wrapper">
				<h3>Forgot Password</h3>
				Enter the email address of each member of your team to invite them to this project.
				<div className="recover-page-form-wrapper">
					{(errorMsg !== '') && (<div className="input-wrapper input-wrapper-error"><input type="text" placeholder="" value={errorMsg} disabled /></div>)}
					<form onSubmit={this.handleSubmit}>
						<div className={emailClass}><input type="text" name="email" placeholder="Enter Email Address" value={email} onFocus={()=> this.setState({ action : '', errorMsg : '' })} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className="overlay-button-wrapper"><Row vertical="center">
							<Column><button type="submit" className="adjacent-button" onClick={(event)=> this.handleSubmit(event)}>Submit</button></Column>
						</Row></div>
					</form>
				</div>
			</div>
		);
	}
}

export default RecoverPage;
