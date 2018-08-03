
import React, { Component } from 'react';
import './PurchaseStep.css';

import CurrencyFormat from 'react-currency-format';
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

		this.STRIPE_TEST_TOKEN = 'pk_test_hEOqIXLLiGcTTj7p2W9XxuCP';
		this.STRIPE_LIVE_TOKEN = 'pk_live_7OvF9BcQ3LvNZd0z0FsPPgNF';
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
// 		console.log("render() "+JSON.stringify(this.state));
		const items = this.state.allItems.map((item, i, arr) => {
			return (
				<Column key={i}>
					<TemplateItem handleClick={(isSelected)=> this.handleClick(item.id, isSelected)} image={item.filename} title={(i+1)} price={'1.99'} selected={true} />
				</Column>
			);
		});

		let amount = 0;
		this.props.selectedItems.forEach(function(item, i) {
			amount += parseFloat(item.per_price);
		});

		const btnClass = (this.state.selectedItems.length > 0) ? 'action-button full-button' : 'action-button full-button disabled-button';

		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Enter payment information</div>
					<div className="step-text">The following Design Systems examples have been generated from Design Engine.</div>
					<div style={{width:'100%', textAlign:'left'}}>
						<div className="input-title">Details</div>
						<StripeProvider apiKey={this.STRIPE_TEST_TOKEN}>
							{/*<StripeProvider apiKey={this.STRIPE_LIVE_TOKEN}>*/}
							<div className="example" style={{width:'100%'}}>
								<Elements>
									<StripeCheckout />
								</Elements>
							</div>
						</StripeProvider>

						<div className="checkout-price">
							<CurrencyFormat value={amount} displayType={'text'} thousandSeparator={true} prefix={'$'} /> USD
						</div>

						<button className={btnClass} onClick={()=> this.onNext()}>Confirm Purchase</button>
						<div className="step-text">By clicking &ldquo;Confirm Purchase&rdquo; I agree to Design Engine AI’s Terms of Service.</div>
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
