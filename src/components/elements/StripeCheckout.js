
import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';

class StripeCheckout extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this);
	}

	async submit(ev) {
		// User clicked submit
	}

	render() {
		return (
			<div className="checkout">
				<p>Complete the purchase</p>
				<CardElement />
				<button onClick={this.submit}>Send</button>
			</div>
		);
	}
}

export default injectStripe(StripeCheckout);