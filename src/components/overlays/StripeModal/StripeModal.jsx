
import React, { Component } from 'react';
import './StripeModal.css';

import { loadStripe } from '@stripe/stripe-js';
import { Strings } from 'lang-js-utils';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import { POPUP_TYPE_ERROR } from '../PopupNotification';
import { Modals } from '../../../consts/uris';
import { makeStripeSession } from '../../../redux/actions';
import { trackEvent, trackOutbound } from '../../../utils/tracking';
import stripeCreds from '../../../assets/json/configs/stripe-creds';


const STRIPE_PUBLIC_TOKEN = stripeCreds.test.publish;
// const STRIPE_PUBLIC_TOKEN = stripeCreds.live.publish;


const stripePromise = loadStripe(STRIPE_PUBLIC_TOKEN);



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

		return (<BaseOverlay
			tracking={Modals.STRIPE}
			outro={outro}
			closeable={true}
			title={null}
			onComplete={this.handleComplete}>
			<div className="stripe-modal">
				<div className="header-wrapper"><h4>
					Your domain has reached {team.userCount} {Strings.pluralize('Member', team.userCount)} users.<br />
					To continue using Pair, please subscribe:<br />
					Monthly - <span className="price">$10</span> per month per user (<span className="price">${team.members.length * 10}</span> total)< br />
					Yearly - <span className="price">$8</span> per month per user (<span className="price">${(team.members.length * 8) * 12}</span> total)< br />
				</h4></div>
				<div>
					<button onClick={(event)=> this.handleSubmit(event, products[0])}>Monthly</button>
					<button onClick={(event)=> this.handleSubmit(event, products[1])}>Yearly</button>

					<div className="form-disclaimer">
						<NavLink to="https://spectrum.chat/pair" target="_blank" onClick={(event)=> this.handleURL(event, 'https://spectrum.chat/pair')}>Need More details about our Plans?</NavLink>
					</div>
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


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StripeModal));
