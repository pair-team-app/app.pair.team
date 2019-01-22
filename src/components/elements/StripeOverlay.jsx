
import React from 'react';
import './StripeOverlay.css';

import { Elements, StripeProvider } from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

import StripeCheckout from './StripeCheckout';
import stripeLogo from '../../assets/images/logos/logo-stripe.png';
import stripe from '../../assets/json/stripe.json';

const STRIPE_TEST_TOKEN = stripe.test.publish;
const STRIPE_LIVE_TOKEN = stripe.live.publish;

function StripeOverlay(props) {
	return (
		<div className="overlay-wrapper">
			<div className="overlay-close-background" onClick={()=> props.onClick('cancel')} />
			<div className="overlay-container"><Row horizontal="center">
				<div className="overlay-content">
					<div className="page-header">
						<Row horizontal="center"><h1>One Plan, $2.99 per month</h1></Row>
						<div className="page-header-text">Design Engine is the first design platform built for engineers. From open source projects to enterprise, you can inspect parts, download source, and build interface along worldclass designers.</div>
						<Row horizontal="center"><button onClick={()=> props.onClick('cancel')}>Cancel</button></Row>
					</div>
					<h3>Payment details</h3>
					<StripeProvider apiKey={STRIPE_TEST_TOKEN}>
						{/*<StripeProvider apiKey={STRIPE_LIVE_TOKEN}>*/}
						<Elements>
							<StripeCheckout />
						</Elements>
					</StripeProvider>
					<div className="overlay-button-wrapper">
						<button className="overlay-button overlay-button-confirm" onClick={()=> props.onClick('submit')}>Submit</button>
					</div>
					<Row horizontal="center">
						<img className="stripe-overlay-logo" src={stripeLogo} alt="Stripe logo" />
					</Row>
					<Row horizontal="space-between" style={{ flexWrap : 'wrap' }}>
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

export default StripeOverlay;
