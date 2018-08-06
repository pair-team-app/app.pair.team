
import React, {Component} from 'react';

import { CardNumberElement, CardExpiryElement, CardCVCElement, injectStripe } from 'react-stripe-elements';

import InputField from '../InputField';

class StripeCheckout extends Component {
	constructor(props) {
		super(props);
		this.submit = this.submit.bind(this);
	}

	async submit(ev) {
		let {token} = await this.props.stripe.createToken({name: "Name"});
// 		let response = await fetch("/charge", {
// 			method: "POST",
// 			headers: {"Content-Type": "text/plain"},
// 			body: token.id
// 		});

// 		if (response.ok) console.log("Purchase Complete!")

		console.log("TOKEN", token);
	}

	handleTextChange(event) {

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

				<div className="form-element"><CardNumberElement className="textfield-input" /></div>
				<div className="form-element"><CardExpiryElement className="textfield-input" /></div>
				<div className="form-element"><CardCVCElement className="textfield-input" /></div>
				<div className="form-element"><button onClick={this.submit}>Send</button></div>
			</div>
		);
	}
}

export default injectStripe(StripeCheckout);