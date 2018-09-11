
import React, {Component} from 'react';

import axios from 'axios';
// import CurrencyFormat from 'react-currency-format';
import ReactPixel from 'react-facebook-pixel';
import { Row } from 'simple-flexbox';
import { CardCVCElement, CardExpiryElement, CardNumberElement, injectStripe } from 'react-stripe-elements';


class StripeCheckout extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cardholder : ''
		};

		this.handleTextChange = this.handleTextChange.bind(this);
		this.submit = this.submit.bind(this);
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
		const options = {
			autoConfig : true, 	// set pixel's autoConfig
			debug      : false, // enable logs
		};
		ReactPixel.init('318191662273348', advancedMatching, options);
	}

	async submit(ev) {
		ReactPixel.trackCustom('purchase');

		let token = await this.props.stripe.createToken({ name : this.state.cardholder });
		let amount = this.props.amount;

		console.log("token", token);

		this.props.onNext();

		setTimeout(function() {
			let formData = new FormData();
			formData.append('token_id', token.token.id);
			formData.append('amount', amount);
// 		axios.post('/stripe_checkout.php', formData)
			axios.post('http://stage.designengine.ai/stripe_checkout.php', formData)
				.then((response)=> {
					console.log("stripe_checkout", JSON.stringify(response.data));
					this.props.handleStep5();
// 					if (response.data.result) {
// 						this.props.handleStep5();
// 					}
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
		const btnClass = (this.props.amount > 0) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div className="checkout">
				<Row horizontal="center">
					<button className="form-button form-button-secondary" onClick={()=> this.props.onBack()}>Back</button>
					<button className={btnClass} onClick={()=> this.submit()}>Submit</button>
				</Row>

				<div className="form-element">
					<input className="textfield-input" style={{textAlign:'left'}} type="text" name="customer-name" placeholder="Name" value={this.state.cardholder} onChange={this.handleTextChange} />
				</div>

				<div className="form-element">
					<CardNumberElement className="textfield-input" />
				</div>

				<div className="form-element">
					<CardExpiryElement className="textfield-input" />
				</div>

				<div className="form-element">
					<CardCVCElement className="textfield-input" />
				</div>
			</div>
		);
	}
}

export default injectStripe(StripeCheckout);