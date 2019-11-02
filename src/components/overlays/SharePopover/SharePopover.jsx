
import React, { Component } from 'react';
import './SharePopover.css';

import axios from 'axios';
import { Strings } from 'lang-js-utils';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';

import BasePopover from '../BasePopover';
import {API_ENDPT_URL} from "../../../consts/uris";
import { trackEvent } from '../../../utils/tracking';


class SharePopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email      : '',
			emailValid : false
		};
	}

	handleClipboardCopy = ()=> {
		console.log('%s.handleClipboardCopy()', this.constructor.name);

		trackEvent('button', `copy-share-url`);
		this.props.onClose();
	};

	handleEmailChange = (event)=> {
// 		console.log('%s.handleEmailChange()', this.constructor.name);

		const email = event.target.value;
		const emailValid = Strings.isEmail(email);
		this.setState({ email, emailValid });
	};

	handleSubmit = (event)=> {
		console.log('%s.handleSubmit()', this.constructor.name);
		event.preventDefault();

		const { email, emailValid } = this.state;
		if (email.length > 0 && emailValid) {
			trackEvent('button', `send-invite`);
			const { playground } = this.props;

			axios.post(API_ENDPT_URL, {
				action  : 'INVITE',
				payload : {
					playground_id : playground.id,
					email         : email,
					user_id       : this.props.profile.id
				}
			}).then((response)=> {
				console.log('INVITE', response.data);
// 				const { invite } = response.data;
				this.props.onClose();

			}).catch((error)=> {
			});

		} else {
			this.setState({ emailValid : false });
		}
	};


	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { position } = this.props;
		const { email, emailValid } = this.state;

		const payload = {
			position : { ...position,
				x : position.x - 30,
				y : position.y + 7
			}
		};
		return (<BasePopover payload={payload} onOutroComplete={this.props.onClose}>
			<div className="share-popover">
				<div className="share-popover-url">{window.location.href}</div>
				<div className="share-popover-form-wrapper">
					<form onSubmit={this.handleSubmit}>
						<input type="text" value={email} placeholder="Enter Email Address" onChange={(event)=> this.handleEmailChange(event)} />
						<button disabled={!emailValid} type="submit" onClick={this.handleSubmit}>Send Email</button>
						<CopyToClipboard text={window.location.href} onCopy={()=> this.handleClipboardCopy()}>
							<button disabled={false} onClick={(event) => event.preventDefault()}>Copy URL</button>
						</CopyToClipboard>
					</form>
				</div>
			</div>
		</BasePopover>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		profile : state.userProfile,
	});
};


export default connect(mapStateToProps)(SharePopover);
