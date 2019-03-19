
import React, { Component } from 'react';
import './StripeForm.css'

import { CardCVCElement, CardExpiryElement, CardNumberElement, injectStripe } from 'react-stripe-elements';
import { Column, Row } from 'simple-flexbox';

import { Components } from '../../utils/lang';
import { trackEvent } from '../../utils/tracking';


class StripeForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cardHolder      : '',
			cardHolderValid : true
		};
	}

	componentDidMount() {
// 		console.log('StripeForm.componentDidMount()', this.props, this.state);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('StripeForm.componentDidUpdate()', prevProps, this.props, prevState, this.state);
	}

	componentWillUnmount() {
// 		console.log('StripeForm.componentWillUnmount()', this.props, this.state);
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
		const cardHolderValid = (cardHolder.length > 0);

		this.setState({ cardHolderValid,
			cardHolder : (cardHolderValid) ? cardHolder : 'Card Holder Invalid'
		});

		if (cardHolderValid) {
			this.props.stripe.createToken({ name : cardHolder }).then((result)=> {
				if (result.error) {
					this.props.onError(result.error);

				} else {
					this.props.onSubmit(cardHolder, result.token);
				}
			});
		}
	};


	render() {
// 		console.log('StripeForm.render()', this.props, this.state);

		const { cardHolder, cardHolderValid } = this.state;

		return (
			<div className="stripe-form-wrapper">
				<Column horizontal="center" vertical="start">
					<div className={Components.txtFieldClassName(cardHolderValid)}><input type="text" className="input-field-textfield" name="cardHolder" placeholder="Card Holder" value={cardHolder} onFocus={this.handleFocus} onChange={(event)=> this.handleChange(event.target)} /></div>

					<div className="input-wrapper">
						<CardNumberElement className="input-txt" />
					</div>

					<div className="input-wrapper">
						<CardExpiryElement className="input-txt" />
					</div>

					<div className="input-wrapper">
						<CardCVCElement className="input-txt" />
					</div>

					<Row horizontal="start" vertical="center" className="full-width">
						<button disabled={(!cardHolderValid)} className="adjacent-button" onClick={(event)=> this.handleSubmit(event)}>Submit</button>
						<button className="adjacent-button" onClick={()=> {trackEvent('button', 'purchase-cancel'); this.props.onCancel()}}>Cancel</button>
						<div className="page-link page-link-form" onClick={()=> {trackEvent('link', 'terms'); this.props.onPage('terms')}}>Pay Terms</div>
					</Row>
				</Column>
			</div>
		);
	}
}

export default injectStripe(StripeForm);
