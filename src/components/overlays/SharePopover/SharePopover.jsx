
import React, { Component } from 'react';
import './SharePopover.css';

import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';

import BasePopover from '../BasePopover';
import {decryptObject, decryptText} from "../../pages/PlaygroundPage/utils/crypto";
import moment from "moment/moment";
import {API_ENDPT_URL} from "../../../consts/uris";
//import { trackEvent } from '../../../utils/tracking';


class SharePopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email : ''
		};
	}

	handleClipboardCopy = ()=> {
		console.log('SharePopover.handleClipboardCopy()');

// 		trackEvent('button', `copy-share-url`);
		this.props.onClose();
	};

	handleCopyURL = (event)=> {
		console.log('SharePopover.handleSendInvite()');
		event.preventDefault();
	};

	handleEmailChange = (event)=> {
		console.log('SharePopover.handleEmailChange()');
		this.setState({ email : event.target.value });
	};

	handleSendInvite = (event)=> {
		console.log('SharePopover.handleSendInvite()');
	};

	handleSubmit = (event)=> {
		console.log('SharePopover.handleSubmit()');
		event.preventDefault();

		const { playground } = this.props;

		axios.post(API_ENDPT_URL, {
			action  : 'INVITE',
			payload : {
				playground_id : playground.id,
			}
		}).then((response) => {
			console.log('INVITE', response.data);
			const { invite } = response.data;
			this.props.onClose();
		}).catch((error)=> {
		});
	};


	render() {
		const { pos } = this.props;
		const { email } = this.state;

		return (<BasePopover pos={pos} onClose={this.props.onClose}>
			<div className="share-popover">
				<div className="share-popover-url">{window.location.href}</div>
				<div className="share-popover-form-wrapper">
					<form onSubmit={this.handleSubmit}>
						<input type="text" value={email} placeholder="Enter Email Address" onChange={(event)=> this.handleEmailChange(event)} />
						<button disabled={false} type="submit" onClick={this.handleSendInvite}>Send Email</button>
						<CopyToClipboard text={window.location.href} onCopy={()=> this.handleClipboardCopy()}>
							<button disabled={false} onClick={this.handleCopyURL}>Copy URL</button>
						</CopyToClipboard>
					</form>
				</div>
			</div>
		</BasePopover>);
	}
}


export default (SharePopover);
