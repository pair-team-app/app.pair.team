
import React, { Component } from 'react';
import './StripeModal.css';

import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { URIs } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

import BaseOverlay from '../BaseOverlay';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL, Modals, Pages } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';
import stripeCreds from '../../../assets/json/configs/stripe-creds';
import { fetchTeamLookup } from '../../../redux/actions';


const STRIPE_PUBLIC_TOKEN = stripeCreds.test.publish;
// const STRIPE_PUBLIC_TOKEN = stripeCreds.live.publish;


const stripePromise = loadStripe(STRIPE_PUBLIC_TOKEN);



class StripeModal extends Component {
	constructor(props) {
// console.log('%s.CONSTRUCTOR()', 'StripeModal', props);

		super(props);

		this.state = {
			payment    : null,
			submitting : false,
			outro      : false,
			outroURI   : null
		};
	}

	handleComplete = ()=> {
// console.log('%s.handleComplete()', this.constructor.name);

		this.setState({ outro : false }, ()=> {
			const { purchase, outroURI } = this.state;
			if (purchase) {
				this.props.onSubmitted(purchase);

			} else {
				this.props.onComplete();
			}

			if (outroURI) {
				this.props.history.push(outroURI);
			}
		});
	};

	handleError = (error)=> {
// console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			type    : POPUP_TYPE_ERROR,
			content : error.code
		});
	};

	handlePage = (url)=> {
// console.log('%s.handlePage()', this.constructor.name, url);

		if (url.startsWith('/modal')) {
			this.props.onModal(`/${URIs.lastComponent(url)}`);

		} else {
			this.setState({
				outro    : true,
				outroURI : url
			});
		}
	};

	handleSubmit = async(event, payment)=> {
		console.log('%s.handleSubmit()', this.constructor.name, { event, payment });

		event.preventDefault();

		const { team } = this.props;
		this.setState({ submitting : true }, ()=> {
			axios.post(API_ENDPT_URL, {
				action  : 'STRIPE_SESSION',
				payload : { payment,
					quantity : team.members.length
				}
			}).then(async(response)=> {
				console.log('STRIPE_SESSION', response.data);
				const { session, error } = response.data;

				if (error) {
					this.props.onPopup({
						type    : POPUP_TYPE_ERROR,
						content : error.code
					});

				} else {
					const stripe = await stripePromise;
					const { error } = await stripe.redirectToCheckout({ sessionId : session.id });


					this.props.onPopup({
						type     : POPUP_TYPE_OK,
						content  : `Session ID ${session.id}`,
						duration : 3333
					});
				}

				// this.setState({
				// 	outro      : true,
				// 	submitting : false,
				// 	purchase   : purchase
				// });
			}).catch((error)=> {
			});
		});
	};

	render() {
// console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { team } = this.props;
		const { outro, submitting } = this.state;
		return (<BaseOverlay
			tracking={Modals.STRIPE}
			outro={outro}
			closeable={true}
			title={null}
			onComplete={this.handleComplete}>

			<div className="stripe-modal">
				<div className="stripe-modal-header-wrapper"><h4>
					Your domain has reached {team.members.length} users.<br />
					To continue using Pair, please subscribe:<br />
					Monthly - <span className="stripe-form-price">$10</span> per month per user (<span className="stripe-form-price">${team.members.length * 10}</span>)< br />
					Yearly - <span className="stripe-form-price">$8</span> per month per user (<span className="stripe-form-price">${(team.members.length * 8) * 12}</span>)< br />

				</h4></div>
				<div className="stripe-modal-content-wrapper">
					<button onClick={(event)=> this.handleSubmit(event, 'monthly')}>Monthly</button>
					<button onClick={(event)=> this.handleSubmit(event, 'yearly')}>Yearly</button>

					<div className="form-disclaimer">
						<NavLink to={Pages.TERMS} onClick={this.handlePage}>Need More details about our Plans?</NavLink>
					</div>
				</div>
				{/* {(submitting) && (<div className="base-overlay-loader-wrapper">
					<div className="base-overlay-loader">
						<FontAwesome name="circle-notch" className="base-overlay-loader-spinner" size="3x" spin />
					</div>
				</div>)} */}
			</div>
		</BaseOverlay>);
	}
}


const mapStateToProps = (state, ownProps)=> {
  return ({
    team : state.team
  });
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		fetchTeamLookup : (payload)=> dispatch(fetchTeamLookup(payload))
	});
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StripeModal));
