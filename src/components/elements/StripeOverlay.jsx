
import React, { Component } from 'react';
import './Overlay.css';

import FontAwesome from 'react-fontawesome';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { Row, Column } from 'simple-flexbox';

import StripeCheckout from './StripeCheckout';
import stripe from '../../json/stripe.json';

class StripeOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email1 : '',
			email2 : '',
			email3 : ''
		};

		this.STRIPE_TEST_TOKEN = stripe.test.publish;
		this.STRIPE_LIVE_TOKEN = stripe.live.publish;
	}

	render() {
		return (
			<div className="overlay-wrapper">
				<div className="overlay-container">
					<div className="overlay-content">
						<div className="page-header">
							<Row horizontal="center"><div className="page-header-text">One Plan, $2.99 per month</div></Row>
							<div className="page-subheader-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button className="page-button" onClick={()=> this.props.onClick('cancel')}>Cancel</button></Row>
						</div>
						<div className="input-title">Payment details</div>
						<StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>
							{/*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*/}
							<Elements>
								<StripeCheckout />
							</Elements>
						</StripeProvider>
					</div>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> this.props.onClick('submit')}>Submit</button>
					</div>
				</div>
			</div>
		);
	}
}

export default StripeOverlay;
