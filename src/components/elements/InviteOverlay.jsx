
import React, { Component } from 'react';
import './Overlay.css';

import axios from 'axios';
import cookie from 'react-cookies';
import FontAwesome from 'react-fontawesome';
import { Row, Column } from 'simple-flexbox';

class InviteOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			action      : '',
			email1      : '',
			email2      : '',
			email3      : '',
			email1Valid : false,
			email2Valid : false,
			email3Valid : false
		};
	}

	submit = ()=> {
		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const isEmail1Valid = re.test(String(this.state.email1).toLowerCase());
		const isEmail2Valid = re.test(String(this.state.email2).toLowerCase());
		const isEmail3Valid = re.test(String(this.state.email3).toLowerCase());

		this.setState({
			action : 'INVITE',
			email1Valid : isEmail1Valid,
			email2Valid : isEmail2Valid,
			email3Valid : isEmail3Valid
		});

		let emails = '';
		if (isEmail1Valid) {
			emails += this.state.email1 + " ";
		}

		if (isEmail2Valid) {
			emails += this.state.email2 + " ";
		}

		if (isEmail3Valid) {
			emails += this.state.email3;
		}

		if (isEmail1Valid || isEmail2Valid || isEmail3Valid) {
			let formData = new FormData();
			formData.append('action', 'INVITE');
			formData.append('user_id', cookie.load('user_id'));
			formData.append('emails', emails);
			axios.post('https://api.designengine.ai/system.php', formData)
				.then((response) => {
					console.log('INVITE', JSON.stringify(response.data));
					this.props.onClick('submit');
				}).catch((error) => {
			});
		}
	};

	render() {
		const email1Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email1Valid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email2Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email2Valid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';
		const email3Class = (this.state.action === '') ? 'input-wrapper' : (this.state.action === 'INVITE' && !this.state.email3Valid) ? 'input-wrapper input-wrapper-error' : 'input-wrapper';

		return (
			<div className="overlay-wrapper">
				<div className="overlay-container">
					<div className="overlay-logo-wrapper"><img src="/images/logo.svg" className="overlay-logo" alt="Design Engine" /></div>
					<div className="overlay-title">Invite 3 team members below to Design Engine.</div>
					<div className="overlay-content">
						<div className="input-title">Invite team members</div>
						<div className={email1Class}><input type="text" name="email1" placeholder="Engineer Email" value={this.state.email1} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={email2Class}><input type="text" name="email2" placeholder="Engineer Email" value={this.state.email2} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
						<div className={email3Class}><input type="text" name="email3" placeholder="Engineer Email" value={this.state.email3} onChange={(event)=> this.setState({ [event.target.name] : event.target.value })} /></div>
					</div>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> this.submit()}><Row>
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
