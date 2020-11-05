
import React, { Component } from 'react';
import './StripeModal.css';

import { loadStripe } from '@stripe/stripe-js';
import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import { Modals } from '../../../consts/uris';
import { makeStripeSession } from '../../../redux/actions';
import { trackEvent, trackOutbound } from '../../../utils/tracking';
import stripeCreds from '../../../assets/json/configs/stripe-creds';


const stripePromise = loadStripe((process.env.NODE_ENV === 'development') ? stripeCreds.test.publish : stripeCreds.live.publish);


class StripeModal extends Component {
	constructor(props) {
		// console.log('%s.CONSTRUCTOR()', 'StripeModal', { props });

		super(props);

		this.state = {
			payment : null,
			outro   : false,
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps, props : this.props, prevState, state : this.state });

		const { stripeSession } = this.props;
		if (!prevProps.stripeSession && stripeSession) {
			this.onStripeSession();
		}
	}


	handleComplete = ()=> {
		// console.log('%s.handleComplete()', this.constructor.name);

		this.setState({ outro : false }, ()=> {
			this.props.onComplete();
		});
	};


	handleURL = (event, url)=> {
		console.log('%s.handleURL()', this.constructor.name, { event, url });

		event.preventDefault();
		trackOutbound(url);
	};


	handleSubmit = (event, product)=> {
		console.log('%s.handleSubmit()', this.constructor.name, { event, product });

		event.preventDefault();
		trackEvent('button', `${product.billing}-subscription`);
		this.props.makeStripeSession({ product })
	};

	onStripeSession = async()=> {
		console.log('%s.onStripeSession()', this.constructor.name);

		const { stripeSession } = this.props;

		const stripe = await stripePromise;
		const { error } = await stripe.redirectToCheckout({ sessionId : stripeSession.id });

		if (error) {
			this.props.onPopup({
				type    : POPUP_TYPE_ERROR,
				content : error.code
			});
		}
	};


	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { products, team } = this.props;
		const { outro } = this.state;

		const { userCount, members } = team;

		return (<BaseOverlay
			tracking={Modals.STRIPE}
			outro={outro}
			closeable={false}
			title="Free team limit has been reached."
			onComplete={this.handleComplete}>
			<div className="stripe-modal">
				<div className="header-wrapper"><h4>
					Your domain has reached {userCount} {Strings.pluralize('Member', userCount)} users.<br />
					To continue using Pair, please subscribe:
					<ul>
						<li>Monthly - <span className="price">$10</span> per month per user (<span className="price">${members.length * 10}</span> total)< br /></li>
						<li>Yearly - <span className="price">$8</span> per month per user (<span className="price">${(members.length * 8) * 12}</span> total)< br /></li>
					</ul>
				</h4></div>
				<div className="button-wrapper button-wrapper-col">
					<button onClick={(event)=> this.handleSubmit(event, products[0])}>Monthly</button>
					<button onClick={(event)=> this.handleSubmit(event, products[1])}>Yearly</button>
				</div>

				<div className="form-disclaimer">
						<NavLink to="https://spectrum.chat/pair" target="_blank" onClick={(event)=> this.handleURL(event, 'https://spectrum.chat/pair')}>Need More details about our Plans?</NavLink>
					</div>
			</div>
		</BaseOverlay>);
	}
}


const mapDispatchToProps = (dispatch)=> {
  return ({
    makeStripeSession : (payload)=> dispatch(makeStripeSession(payload))
  });
};


const mapStateToProps = (state, ownProps)=> {
  return ({
		products      : state.products,
		stripeSession : state.stripeSession,
    team          : state.teams.team
  });
};


export default connect(mapStateToProps, mapDispatchToProps)(StripeModal);
