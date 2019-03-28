
import React, { Component } from 'react';
import './SignupModal.css';

import axios from 'axios';
import qs from 'qs';

import BaseOverlay from '../BaseOverlay';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL } from '../../../../consts/uris';
import { URLs } from '../../../../utils/lang';
import { trackEvent } from '../../../../utils/tracking';

class SignupModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	handleComplete = ()=> {
// 		console.log('SignupModal.handleComplete()');

		this.setState({ outro : false}, ()=> {
			const { approved, purchase, redirect } = this.state;
			if (approved) {
				this.props.onPurchase(purchase);
			}

			if (redirect) {
				this.props.onPage(redirect);
			}

			this.props.onComplete();
		});
	};

	handleSubmit = ()=> {
// 		console.log('SignupModal.handleSubmit()');

		const { profile } = this.props;
		this.setState({ submitting : true });

		axios.post(API_ENDPT_URL, qs.stringify({
			action      : 'USER_CONFIG',
			user_id     : profile.id
		})).then((response)=> {
			console.log('USER_CONFIG', response.data);
			//const { purchase, error } = response.data;
			trackEvent('config', 'success', null, profile.id);

			this.props.onPopup({
				position : POPUP_POSITION_TOPMOST,
				type     : POPUP_TYPE_OK,
				content  : 'Submitted!'
				});
		}).catch((error)=> {
		});
	};

	render() {
// 		console.log('SignupModal.render()', this.props, this.state);

		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={`signup/${URLs.firstComponent()}`}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="signup-modal-wrapper">
					<div className="signup-modal-header">
						<h4>Title Here</h4>
					</div>

					<div className="signup-modal-content-wrapper">
					</div>
				</div>
			</BaseOverlay>);
	}
}

export default SignupModal;
