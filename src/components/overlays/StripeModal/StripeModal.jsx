
import React, { Component } from 'react';
import './StripeModal.css';

import axios from 'axios';
import { URIs } from 'lang-js-utils';
import { Elements, StripeProvider } from 'react-stripe-elements';

import BaseOverlay from '../BaseOverlay';
import StripeForm from '../../forms/StripeForm/StripeForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL } from '../../../consts/uris';
import { sendToSlack } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';
import stripeCreds from '../../../assets/json/stripe-creds';
import stripeLogo from '../../../assets/images/logos/logo-stripe.png';


const STRIPE_TEST_TOKEN = stripeCreds.test.publish;
// const STRIPE_LIVE_TOKEN = stripeCreds.live.publish;


const PRODUCT_IDS = [1];


class StripeModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			submitting : false,
			approved   : false,
			outro      : false,
			purchase   : null,
			redirect   : null
		};
	}

	handleComplete = ()=> {
// 		console.log('StripeModal.handleComplete()');

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
		console.log('StripeModal.handleError()', error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
		});
	};

	handlePage = (url)=> {
// 		console.log('StripeModal.handlePage()', url);

		this.setState({
			outro    : true,
			redirect : url
		});
	};

	handleSubmit = (cardHolder, token)=> {
// 		console.log('StripeModal.handleSubmit()', cardHolder, token, this.state);

		const { profile } = this.props;
		this.setState({ submitting : true });

		axios.post(API_ENDPT_URL, {
			action  : 'MAKE_PURCHASE',
			payload : {
				user_id     : profile.id,
				token_id    : token.id,
				product_ids : PRODUCT_IDS.join(',')
			}
		}).then((response) => {
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
// 		console.log('StripeModal.render()', this.props, this.state);

		const { outro } = this.state;
		return (
			<BaseOverlay
				tracking={`stripe/${URIs.firstComponent()}`}
				outro={outro}
				unblurred={true}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="stripe-modal-wrapper">
					<div className="stripe-modal-header">
						<img className="stripe-modal-logo" src={stripeLogo} alt="Stripe logo" />
					</div>

					<div className="stripe-modal-content-wrapper">
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

export default StripeModal;
