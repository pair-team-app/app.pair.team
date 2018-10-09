
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
					<div className="overlay-logo-wrapper"><img src="/images/logo.svg" className="overlay-logo" alt="Design Engine" /></div>
					<div className="overlay-title">Design Engine is ONLY $4.99 per month for the first 1000 customers who sign up.</div>
					<div className="overlay-content">
						<div className="input-title">Payment Information</div>
						<StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>
							{/*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*/}
							<Elements>
								<StripeCheckout />
							</Elements>
						</StripeProvider>
					</div>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> this.props.onClick('invite')}><Row>
							<Column flexGrow={1} horizontal="start" vertical="center">Purchase Now</Column>
							<Column flexGrow={1} horizontal="end" vertical="center"><FontAwesome name="caret-right" className="overlay-button-confirm-arrow" /></Column>
						</Row></button>
						<button className="overlay-button overlay-button-cancel" onClick={()=> this.props.onClick('cancel')}>Cancel</button>
					</div>
				</div>
			</div>
		);
	}
}

export default StripeOverlay;
