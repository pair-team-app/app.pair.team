
import React, { Component } from 'react';
import './PurchaseStep.css';
import stripe from '../../stripe.json';

import {Elements, StripeProvider} from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

import StripeCheckout from '../elements/StripeCheckout';
import TemplateItem from '../TemplateItem';

class PurchaseStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedItems : this.props.selectedItems,
			allItems      : this.props.selectedItems
		};

		this.STRIPE_TEST_TOKEN = stripe.test.publish;
		this.STRIPE_LIVE_TOKEN = stripe.live.publish;
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

	onNext() {
		if (this.state.selectedItems.length > 0) {
			this.props.onClick(this.selectedItems);
		}
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
						title={(i+1)}
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
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Enter your payment details</div>
					<div className="input-title">{this.state.selectedItems.length} Design Engine views for ${amount} USD.</div>
					<div style={{width:'100%', textAlign:'left'}}>
						<StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>
							{/*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*/}
							<div className="example" style={{width:'100%'}}>
								<Elements>
									<StripeCheckout amount={amount} onBack={()=> this.props.onBack(this.state.selectedItems)} />
								</Elements>
							</div>
						</StripeProvider>

						<div className="purchase-item-wrapper">
							<Row horizontal="center" style={{flexWrap:'wrap'}}>
								{items}
							</Row>
						</div>
					</div>
				</Column>
			</Row>
		);
	}
}

export default PurchaseStep;
