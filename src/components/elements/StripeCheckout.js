
import React, {Component} from 'react';

import axios from 'axios';
import CurrencyFormat from 'react-currency-format';
import { CardCVCElement, CardElement, CardExpiryElement, CardNumberElement, injectStripe } from 'react-stripe-elements';

import InputField from '../InputField';

class StripeCheckout extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cardholder : ''
		};

		this.submit = this.submit.bind(this);
	}

	async submit(ev) {
		let {token} = await this.props.stripe.createToken({ name : this.state.cardholder });
		let amount = this.props.amount;

		setTimeout(function() {
			let formData = new FormData();
			formData.append('token_id', token.id);
			formData.append('amount', amount);
// 		axios.post('/stripe_checkout.php', formData)
			axios.post('http://stage.designengine.ai/stripe_checkout.php', formData)
				.then((response)=> {
					console.log("stripe_checkout", JSON.stringify(response.data));
				}).catch((error) => {
			});

		}, 500);
	}

	handleTextChange(event) {
		this.setState({ cardholder : event.target.value })
	}

	handleTooltip(name) {
		console.log("handleTooltip");
	}


	render() {
		return (
			<div className="checkout">
				<InputField
					type="text"
					name="customer-name"
					placeholder="Name"
					onChange={(event)=> this.handleTextChange(event)}
					onClick={(name)=> this.handleTooltip(name)} />

				<div className="form-element">
					<CardNumberElement className="textfield-input" />
					<div className="input-tip input-tip-red">Required</div>
				</div>

				<div className="form-element">
					<CardExpiryElement className="textfield-input" />
					<div className="input-tip input-tip-red">Required</div>
				</div>

				<div className="form-element">
					<CardCVCElement className="textfield-input" />
					<div className="input-tip input-tip-red">Required</div>
				</div>

				<div className="checkout-price">
					Total: <CurrencyFormat value={this.props.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} /> USD
				</div>

				<div className="form-element">
					<button className={this.props.btnClass} onClick={this.submit}>Confirm Purchase</button>
				</div>
			</div>
		);
	}
}

export default injectStripe(StripeCheckout);