
import React, { Component } from 'react';
import './PurchaseStep.css';
import stripe from '../../json/stripe.json';

import ReactPixel from 'react-facebook-pixel';
// eslint-disable-next-line
import {Elements, StripeProvider} from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

// eslint-disable-next-line
import StripeCheckout from '../elements/StripeCheckout';

class PurchaseStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step : 1,
			selectedItems : this.props.selectedItems,
			allItems      : this.props.selectedItems
		};

		this.STRIPE_TEST_TOKEN = stripe.test.publish;
		this.STRIPE_LIVE_TOKEN = stripe.live.publish;
	}

	componentDidMount() {
		const advancedMatching = { em: 'some@email.com' }; // optional, more info: https://developers.facebook.com/docs/facebook-pixel/pixel-with-ads/conversion-tracking#advanced_match
		const options = {
			autoConfig : true, 	// set pixel's autoConfig
			debug      : false, // enable logs
		};
		ReactPixel.init('318191662273348', advancedMatching, options);
	}

	handleClick(id, isSelected) {
		console.log("handleClick("+id+", "+isSelected+")");

// 		let self = this;
		let selectedItems = this.state.selectedItems.slice();

		if (isSelected) {
			this.state.allItems.forEach(function(item, i) {
				if (item.id === id) {

					let isFound = false;
					selectedItems.forEach(function(itm, j) {
						if (itm.id === id) {
							isFound = true;
						}
					});

					if (!isFound) {
						selectedItems.push(item);
					}
				}
			});

		} else {
			selectedItems.forEach(function(item, i) {
				if (item.id === id) {
					selectedItems.splice(i, 1);
				}
			});
		}

		this.setState({ selectedItems : selectedItems });
		this.props.onItemToggle(selectedItems);
	}

	onStripe() {
		ReactPixel.trackCustom('purchase');
		this.setState({ step : 1 });
		this.props.onTooltip({ txt : 'Design Engine is shutting down.'})
	}

	onCC() {
		ReactPixel.trackCustom('purchase');
		this.setState({ step : 1 });
		this.props.onTooltip({ txt : 'Design Engine is shutting down.'})
	}

	onWePay() {
		ReactPixel.trackCustom('purchase');
		this.setState({ step : 1 });
		this.props.onTooltip({ txt : 'Design Engine is shutting down.'})
	}

	render() {
// 		const items = this.state.allItems.map((item, i, arr) => {
// 			let isSelected = false;
//
// 			this.state.selectedItems.forEach(function (itm, i) {
// 				if (itm.id === item.id) {
// 					isSelected = true;
// 				}
// 			});
//
// 			return (
// 				<Column key={i}>
// 					<TemplateItem
// 						onSelectClick={(isSelected)=> this.handleClick(item.id, isSelected)}
// 						image={item.filename}
// 						title=''
// 						description=''
// 						price={parseFloat(item.per_price)}
// 						selected={isSelected} />
// 				</Column>
// 			);
// 		});

// 		let amount = 0;
// 		this.state.selectedItems.forEach(function(item, i) {
// 			amount += parseFloat(item.per_price);
// 		});

		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						{this.state.step === 1 && (
							<div>
								<div className="step-header-text">Congrats, below are your files Download Sketch & Parts Below.</div>
								<div className="input-title">Ready to download.</div>
								<Row horizontal="center">
									<a href="http://cdn.designengine.ai/assets/saas_funnel-test-1.sketch" target="_blank" rel="noopener noreferrer"><div className="purchase-link">Sketch Download</div></a>
								</Row>
								<Row horizontal="center">
									<a href="http://cdn.designengine.ai/assets/saas_funnel-test-1.sketch" target="_blank" rel="noopener noreferrer"><div className="purchase-link">Parts Download</div></a>
								</Row>
								<Row horizontal="center">
									<a href="http://cdn.designengine.ai/assets/saas_funnel-test-1.sketch" target="_blank" rel="noopener noreferrer"><div className="purchase-link">Open with InVision</div></a>
								</Row>
								{/*<Row horizontal="center">*/}
									{/*<a href="https://m.me/DesignEngineAI" target="_blank" rel="noopener noreferrer"><div className="purchase-link">Message Support</div></a>*/}
								{/*</Row>*/}
							</div>
						)}

						{this.state.step === 0 && (
							<div className="purchase-wrapper">
								<div className="purchase-title">Payment</div>
								<div className="purchase-text">Looks like your connection has been lost.</div>

								<button className="action-button purchase-button" onClick={()=> this.onStripe()}>Stripe</button><br />
								<button className="action-button purchase-button" onClick={()=> this.onCC()}>Credit Card</button><br />
								<button className="action-button purchase-button" onClick={()=> this.onWePay()}>WePay</button>

								<div style={{width:'100%', textAlign:'left'}}>
									<StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>
									{/*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*/}
									<div className="example" style={{width:'100%'}}>
									<Elements>
									<StripeCheckout
									amount={amount}
									onBack={()=> this.props.onBack(this.state.selectedItems)}
									onNext={()=> this.props.onNext()}
									/>
									</Elements>
									</div>
									</StripeProvider>

									<div className="purchase-item-wrapper">
										<Row horizontal="center" style={{flexWrap:'wrap'}}>
											{items}
										</Row>
									</div>
								</div>
							</div>
						)}
					</Column>
				</Row>
			</div>
		);
	}
}

export default PurchaseStep;
