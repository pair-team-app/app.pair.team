
import React, { Component } from 'react';
import './Overlay.css';

import FontAwesome from 'react-fontawesome';
import { Row, Column } from 'simple-flexbox';

import InputField from './InputField';

class InviteOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email1 : '',
			email2 : '',
			email3 : ''
		};
	}

	render() {
		return (
			<div className="overlay-wrapper">
				<div className="overlay-container">
					<div className="overlay-logo-wrapper"><img src="/images/logo.svg" className="overlay-logo" alt="Design Engine" /></div>
					<div className="overlay-title">Invite 3 team members below to Design Engine.</div>
					<div className="overlay-content">
						<div className="input-title">Invite team members</div>
						<InputField
							type="email"
							name="email1"
							placeholder="Engineer Email"
							value={this.state.email1}
							onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />

						<InputField
							type="email"
							name="email2"
							placeholder="Engineer Email"
							value={this.state.email2}
							onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />

						<InputField
							type="email"
							name="email3"
							placeholder="Engineer Email"
							value={this.state.email3}
							onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} />
					</div>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> this.props.onClick('invite')}><Row>
							<Column flexGrow={1} horizontal="start" vertical="center">Send Invites Now</Column>
							<Column flexGrow={1} horizontal="end" vertical="center"><FontAwesome name="caret-right" className="overlay-button-confirm-arrow" /></Column>
						</Row></button>
						<button className="overlay-button overlay-button-cancel" onClick={()=> this.props.onClick('cancel')}>Cancel</button>
					</div>
				</div>
			</div>
		);
	}
}

export default InviteOverlay;
