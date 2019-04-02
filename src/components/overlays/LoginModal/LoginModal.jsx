
import React, { Component } from 'react';
import './LoginModal.css';

import axios from 'axios';
import qs from 'qs';

import BaseOverlay from '../BaseOverlay';
import LoginForm from '../../forms/LoginForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL } from './../../../consts/uris';
import { sendToSlack } from './../../../utils/funcs';
import { URLs } from './../../../utils/lang';
import { trackEvent } from './../../../utils/tracking';


class LoginModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			inviteID : props.match.params.inviteID,
			email    : null,
			upload   : null
		};
	}

	handleComplete = ()=> {
// 		console.log('LoginModal.handleComplete()');

		this.setState({ outro : false }, ()=> {
			const { approved, purchase, redirect } = this.state;
			if (approved) {
				this.props.onSubmitted(purchase);

			} else {
				this.props.onComplete();
			}

			if (redirect) {
				this.props.onPage(redirect);
			}
		});
	};

	handleError = (error)=> {
		console.log('LoginModal.handleError()', error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
		});
	};

	handlePage = (url)=> {
// 		console.log('LoginModal.handlePage()', url);

		this.setState({
			outro    : true,
			redirect : url
		});
	};

	handleSubmit = (cardHolder, token)=> {
// 		console.log('LoginModal.handleSubmit()', cardHolder, token, this.state);

		const { profile } = this.props;
		this.setState({ submitting : true });

		axios.post(API_ENDPT_URL, qs.stringify({
			action      : 'MAKE_PURCHASE',
			user_id     : profile.id,
			token_id    : token.id,
			product_ids : PRODUCT_IDS.join(',')
		})).then((response)=> {
			console.log('MAKE_PURCHASE', response.data);
			const { purchase, error } = response.data;
			trackEvent('purchase', (error) ? 'error' : 'success');

			if ((purchase.id << 0) > 0) {
				sendToSlack(`*[\`${profile.id}\`]* *${profile.email}* purchased "_${'Unlimited Site Access'}_" for \`$${4.99}\``);

				this.props.onPopup({
					type    : POPUP_TYPE_OK,
					content : 'Payment Processed!!'
				});

			} else {
				this.props.onPopup({
					position : POPUP_POSITION_TOPMOST,
					type     : POPUP_TYPE_ERROR,
					content  : error.code
				});
			}

			this.setState({
				submitting : false,
				approved   : ((purchase.id << 0) > 0),
				outro      : ((purchase.id << 0) > 0),
				purchase   : purchase
			});
		}).catch((error)=> {
		});
	};

	render() {
// 		console.log('LoginModal.render()', this.props, this.state);

		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={`stripe/${URLs.firstComponent()}`}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="login-modal-wrapper">
					<div className="login-modal-header">
						<img className="login-modal-logo" src={stripeLogo} alt="Stripe logo" />
					</div>

					<div className="login-modal-content-wrapper">
						<StripeProvider apiKey={STRIPE_TEST_TOKEN}>
							<Elements>
								<StripeForm
									onCancel={()=> this.setState({ outro : true })}
									onError={this.handleError}
									onSubmit={this.handleSubmit}
									onPage={this.handlePage}
								/>
							</Elements>
						</StripeProvider>
					</div>
				</div>
			</BaseOverlay>);
	}
}

export default LoginModal;
