
import React, { Component } from 'react';
import './Overlay.css';

import FontAwesome from 'react-fontawesome';
import { Row, Column } from 'simple-flexbox';

import InputField from './InputField';

class RegisterOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			type     : '',
			email    : '',
			password : ''
		};
	}

	render() {
		return (
			<div className="overlay-wrapper">
				<div className="overlay-container">
					<div className="overlay-logo-wrapper"><img src="/images/logo.svg" className="overlay-logo" alt="Design Engine" /></div>
					<div className="overlay-title">To Sign In or Sign Up for Design Engine, enter an email &amp; password below.</div>
					<div className="overlay-content">
						<div className="input-title">Sign Up</div>
						<InputField
							type="email"
							name="email"
							placeholder="Email Address"
							value={this.state.email}
							onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />

						<InputField
							type="password"
							name="password"
							placeholder="Password"
							value={this.state.password}
							onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />

						<div className="input-title">Sign In</div>
						<InputField
							type="email"
							name="email"
							placeholder="Email Address"
							value={this.state.email}
							onChange={(event)=> this.handleTextChange(event)} />

						<InputField
							type="password"
							name="password"
							placeholder="Password"
							value={this.state.password}
							onChange={(event)=> this.handleTextChange(event)} />

					</div>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> this.props.onClick('invite')}><Row>
							<Column flexGrow={1} horizontal="start" vertical="center">Submit</Column>
							<Column flexGrow={1} horizontal="end" vertical="center"><FontAwesome name="caret-right" className="overlay-button-confirm-arrow" /></Column>
						</Row></button>
						<button className="overlay-button overlay-button-cancel" onClick={()=> this.props.onClick('cancel')}>Cancel</button>
					</div>

				</div>
			</div>
		);
	}
}

export default RegisterOverlay;
