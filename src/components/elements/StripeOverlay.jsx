
import React, { Component } from 'react';
import './Overlay.css';
import './StripeOverlay.css';

import { Elements, StripeProvider } from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

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
				<div className="overlay-close-background" onClick={()=> this.props.onClick('cancel')} />
				<div className="overlay-container"><Row horizontal="center">
					<div className="overlay-content">
						<div className="page-header">
							<Row horizontal="center"><h1>One Plan, $2.99 per month</h1></Row>
							<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
							<Row horizontal="center"><button onClick={()=> this.props.onClick('cancel')}>Cancel</button></Row>
						</div>
						<h4>Payment details</h4>
						<StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>
							{/*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*/}
							<Elements>
								<StripeCheckout />
							</Elements>
						</StripeProvider>
						<div className="overlay-button-wrapper">
							<button className="overlay-button overlay-button-confirm" onClick={()=> this.props.onClick('submit')}>Submit</button>
						</div>
						<Row horizontal="center">
							<img className="stripe-overlay-logo" src="/images/stripe-logo.png" alt="Stripe logo" />
						</Row>
						<Row horizontal="space-between" style={{flexWrap:'wrap'}}>
							<Column className="stripe-overlay-faq">
								<div className="stripe-overlay-faq-title">Will Design Engine be a web app or desktop app?</div>
								<div className="stripe-overlay-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
							</Column>
							<Column className="stripe-overlay-faq">
								<div className="stripe-overlay-faq-title">Will Design Engine be a web app or desktop app?</div>
								<div className="stripe-overlay-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
							</Column>
							<Column className="stripe-overlay-faq">
								<div className="stripe-overlay-faq-title">Will Design Engine be a web app or desktop app?</div>
								<div className="stripe-overlay-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
							</Column>
							<Column className="stripe-overlay-faq">
								<div className="stripe-overlay-faq-title">Will Design Engine be a web app or desktop app?</div>
								<div className="stripe-overlay-faq-content"><p>Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</p></div>
							</Column>
						</Row>
					</div>
				</Row></div>
			</div>
		);
	}
}

export default StripeOverlay;
