
import React, { Component } from 'react';
import './PurchaseStep.css';
import stripe from '../../stripe.json';

import ReactPixel from 'react-facebook-pixel';
// eslint-disable-next-line
import {Elements, StripeProvider} from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

import OverlayAlert from '../elements/OverlayAlert';
// eslint-disable-next-line
import StripeCheckout from '../elements/StripeCheckout';
import TemplateItem from '../TemplateItem';

class PurchaseStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			step : 0,
			overlay : {
				isVisible : false,
				title     : '',
				content   : '',
				buttons   : []
			},
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
		this.setState({
			overlay : {
				isVisible : true,
				title     : 'Free Content',
				content   : 'All items are free today.',
				buttons   : []
			}
		})
	}

	onPayPal() {
		ReactPixel.trackCustom('purchase');
		this.setState({
			overlay : {
				isVisible : true,
				title     : 'Free Content',
				content   : 'All items are free today.',
				buttons   : []
			}
		})
	}

	handleAlertConfirm() {
		console.log("handleAlertConfirm()");

		this.setState({
			step : 1,
			overlay : {
				isVisible : false,
				title     : '',
				content   : '',
				buttons   : []
			}
		});
	}

	render() {
		const items = this.state.allItems.map((item, i, arr) => {
			let isSelected = false;

			this.state.selectedItems.forEach(function (itm, i) {
				if (itm.id === item.id) {
					isSelected = true;
				}
			});

			return (
				<Column key={i}>
					<TemplateItem
						onSelectClick={(isSelected)=> this.handleClick(item.id, isSelected)}
						image={item.filename}
						title=''
						description=''
						price={parseFloat(item.per_price)}
						selected={isSelected} />
				</Column>
			);
		});

		let amount = 0;
		this.state.selectedItems.forEach(function(item, i) {
			amount += parseFloat(item.per_price);
		});

		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Choose a payment option</div>
						<div className="input-title">{this.state.selectedItems.length} Design Engine views for ${amount} USD.</div>

						{this.state.step === 0 && (
							<div>
								<button className="action-button step-button" style={{marginBottom:'10px'}} onClick={()=> this.onStripe()}>Stripe</button><br />
								<button className="action-button step-button" onClick={()=> this.onPayPal()}>PayPal</button>

								<div style={{width:'100%', textAlign:'left'}}>
									{/*<StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>*/}
									{/*/!*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*!/*/}
									{/*<div className="example" style={{width:'100%'}}>*/}
									{/*<Elements>*/}
									{/*<StripeCheckout*/}
									{/*amount={amount}*/}
									{/*onBack={()=> this.props.onBack(this.state.selectedItems)}*/}
									{/*onNext={()=> this.props.onNext()}*/}
									{/*/>*/}
									{/*</Elements>*/}
									{/*</div>*/}
									{/*</StripeProvider>*/}

									<div className="purchase-item-wrapper">
										<Row horizontal="center" style={{flexWrap:'wrap'}}>
											{items}
										</Row>
									</div>
								</div>
							</div>
						)}

						{this.state.step === 1 && (
							<a className="step-text" href="http://cdn.designengine.ai/assets/saas_funnel-test-1.sketch" target="_blank" rel="noopener noreferrer">Download Sketch source</a>
						)}
					</Column>
				</Row>

				{this.state.overlay.isVisible && (
					<OverlayAlert
						title={this.state.overlay.title}
						content={this.state.overlay.content}
						buttons={this.state.overlay.buttons}
						onConfirm={()=> this.handleAlertConfirm()}
						onCancel={()=> this.handleAlertCancel()}
					/>
				)}
			</div>
		);
	}
}

export default PurchaseStep;
