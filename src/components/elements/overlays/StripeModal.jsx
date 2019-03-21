
import React, { Component } from 'react';
import './StripeModal.css';

import axios from 'axios';
import qs from 'qs';
import { Elements, StripeProvider } from 'react-stripe-elements';

import ContentModal from './ContentModal';
import StripeForm from '../../forms/StripeForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR, POPUP_TYPE_OK } from './Popup';
import { API_URL } from '../../../consts/uris';
import { URLs } from '../../../utils/lang';
import { trackEvent } from '../../../utils/tracking';
import stripe from '../../../assets/json/stripe';
import stripeLogo from '../../../assets/images/logos/logo-stripe.png';


const STRIPE_TEST_TOKEN = stripe.test.publish;
// const STRIPE_LIVE_TOKEN = stripe.live.publish;


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

	componentDidMount() {
// 		console.log('StripeModal.componentDidMount()');
	}

	handleComplete = ()=> {
// 		console.log('StripeModal.handleComplete()');

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

// 		axios.post(API_URL, qs.stringify({
		axios.post('https://api.designengine.ai/system.php', qs.stringify({
			action      : 'MAKE_PAYMENT',
			user_id     : profile.id,
			token_id    : token.id,
			product_ids : PRODUCT_IDS.join(',')
		})).then((response)=> {
			console.log('MAKE_PAYMENT', response.data);
			const { purchase, error } = response.data;
			trackEvent('purchase', (error) ? 'error' : 'success');

			if ((purchase.id << 0) > 0) {
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
			<ContentModal
				tracking={`stripe/${URLs.firstComponent()}`}
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
			</ContentModal>);
	}
}

export default StripeModal;
