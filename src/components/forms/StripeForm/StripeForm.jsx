
import React, { Component } from 'react';
import './StripeForm.css'

import { Components } from 'lang-js-utils';
import { CardCVCElement, CardExpiryElement, CardNumberElement, injectStripe } from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

import { trackEvent } from '../../../utils/tracking';


const createElementOptions = ()=> ({
	style : {
		base   : {
			fontFamily    : '"San Francisco Text Medium", sans-serif',
			fontSize      : '16px',
			letterSpacing : '-0.3px',
			color         : '#abdafb',

			'::placeholder' : {
				color : '#727d8d',
			}
		},
		invalid : {
			color : '#ff4646'
		},
		complete : {
			color : '#7ed916',
		}
	}
});


class StripeForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cardHolder      : '',
			cardHolderValid : true
		};
	}

	handleChange = (target)=> {
// 		console.log('StripeForm.handleChange()', target);
		this.setState({ [target.name] : target.value });
	};

	handleFocus = (event)=> {
// 		console.log('StripeForm.handleFocus()', event);
		this.setState({
			cardHolder      : '',
			cardHolderValid : true
		});
	};

	handleSubmit = (event)=> {
		console.log('StripeForm.handleSubmit()', event.target);

		event.preventDefault();
		trackEvent('button', 'purchase-submit');

		const { cardHolder } = this.state;
		if (cardHolder.length > 0) {
			this.props.stripe.createToken({ name : cardHolder }).then((result)=> {
				if (result.error) {
					this.props.onError(result.error);

				} else {
					this.props.onSubmit(cardHolder, result.token);
				}
			});

		} else {
			this.props.onCancel();
		}
	};


	render() {
// 		console.log('StripeForm.render()', this.props, this.state);

		const { cardHolder, cardHolderValid } = this.state;

		return (
			<div className="stripe-form-wrapper">
				<Column horizontal="center" vertical="start">
					<form onSubmit={this.handleSubmit} method="post" className="full-width">
						<div className={Components.txtFieldClassName(cardHolder.length > 0 || cardHolderValid)}><input type="text" className="input-field-textfield" name="cardHolder" placeholder="Card Holder" value={cardHolder} onFocus={this.handleFocus} onChange={(event)=> this.handleChange(event.target)} /></div>
						{/*<div className="input-wrapper">*/}
							{/*<CardElement {...createOptions()} />*/}
						{/*</div>*/}

						<div className="input-wrapper">
							<CardNumberElement className="input-txt" {...createElementOptions()} />
						</div>

						<div className="input-wrapper">
							<CardExpiryElement className="input-txt" {...createElementOptions()} />
						</div>

						<div className="input-wrapper">
							<CardCVCElement className="input-txt"  {...createElementOptions()} />
						</div>

						<Row horizontal="start" vertical="center" className="full-width">
							<button disabled={(cardHolder.length === 0)} className="adjacent-button" type="submit">Submit</button>
							<button className="adjacent-button" onClick={()=> {trackEvent('button', 'purchase-cancel'); this.props.onCancel()}}>Cancel</button>
							<div className="page-link page-link-form" onClick={()=> {trackEvent('link', 'terms'); this.props.onPage('terms')}}>Pay Terms</div>
						</Row>
					</form>
				</Column>
			</div>
		);
	}
}

export default injectStripe(StripeForm);
