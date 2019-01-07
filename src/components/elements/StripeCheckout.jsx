
import React, { Component } from 'react';

import axios from 'axios';
// import CurrencyFormat from 'react-currency-format';
import { CardCVCElement, CardExpiryElement, CardNumberElement, injectStripe } from 'react-stripe-elements';


class StripeCheckout extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cardholder : ''
		};

		this.submit = this.submit.bind(this);
	}

	componentDidMount() {
	}

	async submit(ev) {
		let token = await this.props.stripe.createToken({ name : this.state.cardholder });
		console.log("StripeCheckout.submit", ev, token);

		setTimeout(()=> {
			let formData = new FormData();
			formData.append('token_id', token.token.id);
			formData.append('amount', '499');
			axios.post('http://stage.designengine.ai/stripe_checkout.php', formData)
				.then((response)=> {
					console.log("stripe_checkout", response.data);
				}).catch((error) => {
			});
		}, 333);
	}

	render() {
		return (
			<div className="checkout">
				<div className="input-wrapper">
					<input className="textfield-input" style={{ textAlign : 'left' }} type="text" name="customer-name" placeholder="Name" value={this.state.cardholder} onChange={(event)=> this.setState({ cardholder : event.target.value })} />
				</div>

				<div className="input-wrapper">
					<CardNumberElement className="input-txt" />
				</div>

				<div className="input-wrapper">
					<CardExpiryElement className="input-txt" />
				</div>

				<div className="input-wrapper">
					<CardCVCElement className="input-txt" />
				</div>
			</div>
		);
	}
}

export default injectStripe(StripeCheckout);