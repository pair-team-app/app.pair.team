
import React, {Component} from 'react';

import axios from 'axios';
// import CurrencyFormat from 'react-currency-format';
import ReactPixel from 'react-facebook-pixel';
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
		const advancedMatching = { em : 'some@email.com' };
		const options = {
			autoConfig : true,
			debug      : false
		};
		ReactPixel.init('318191662273348', advancedMatching, options);
	}

	async submit(ev) {
		ReactPixel.trackCustom('purchase');

		let token = await this.props.stripe.createToken({ name : this.state.cardholder });
		console.log("token", token);

		setTimeout(function() {
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
					<input className="textfield-input" style={{textAlign:'left'}} type="text" name="customer-name" placeholder="Name" value={this.state.cardholder} onChange={(event)=> this.setState({ cardholder : event.target.value })} />
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