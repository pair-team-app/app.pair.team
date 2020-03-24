
import React, { Component } from 'react';
import './StripeModal.css';

import axios from 'axios';
import { Strings, URIs } from 'lang-js-utils';
import FontAwesome from 'react-fontawesome';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { Elements, StripeProvider } from 'react-stripe-elements';

import BaseOverlay from '../BaseOverlay';
import StripeForm from '../../forms/StripeForm/StripeForm';
import { POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL, Modals, Pages } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';
import stripeCreds from '../../../assets/json/stripe-creds';
import { fetchTeamLookup } from '../../../redux/actions';


const STRIPE_TEST_TOKEN = stripeCreds.test.publish;
// const STRIPE_LIVE_TOKEN = stripeCreds.live.publish;



class StripeModal extends Component {
	constructor(props) {
// 		console.log('%s.CONSTRUCTOR()', 'StripeModal', props);

		super(props);

		this.state = {
			submitting : false,
			outro      : false,
			outroURI   : null,
			purchase   : null,
			product    : this.props.products.pop(), 
			productIDs : Strings.repeat(this.props.products.pop().id, this.props.team.members.length, ',')
		};
	}

	handleComplete = ()=> {
// 		console.log('%s.handleComplete()', this.constructor.name);

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
// 		console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			type    : POPUP_TYPE_ERROR,
			content : error.code
		});
	};

	handlePage = (url)=> {
// 		console.log('%s.handlePage()', this.constructor.name, url);

		if (url.startsWith('/modal')) {
			this.props.onModal(`/${URIs.lastComponent(url)}`);

		} else {
			this.setState({
				outro    : true,
				outroURI : url
			});
		}
	};

	handleSubmit = ({ cardHolder, token })=> {
// 		console.log('%s.handleSubmit()', this.constructor.name, cardHolder, token, this.state);

		this.setState({ submitting : true }, ()=> {
			const { profile, payload } = this.props;
			const { product, productIDs } = this.state;

			axios.post(API_ENDPT_URL, {
				action  : 'MAKE_PURCHASE',
				payload : {
					user_id     : profile.id,
					team_id     : payload.team.id,
					token_id    : token.id,
					product_ids : productIDs
				}
			}).then((response)=> {
// 				console.log('MAKE_PURCHASE', response.data);
				const { purchase, error } = response.data;
				trackEvent('purchase', (error) ? 'error' : 'success');

				if ((purchase.id << 0) === 0) {
					this.props.onPopup({
						type    : POPUP_TYPE_ERROR,
						content : error.code
					});

				} else {
					this.props.onPopup({
						type     : POPUP_TYPE_OK,
						content  : `Successfully purchased monthly subscription "${product.title}" for $${product.price * payload.team.members.length}. (${payload.team.members.length} users x $${product.price})`,
						duration : 3333
					});
				}

				this.setState({
					outro      : true,
					submitting : false,
					purchase   : purchase
				});
			}).catch((error)=> {
			});
		});
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { team } = this.props;
		const { outro, submitting, product } = this.state;
		return (<BaseOverlay
			tracking={Modals.STRIPE}
			outro={outro}
			closeable={true}
			title={null}
			onComplete={this.handleComplete}>

			<div className="stripe-modal">
				<div className="stripe-modal-header-wrapper"><h4>
					Your domain has reached {team.members.length} users.<br />
					To continue using Pair, please sign up<br />
					for <span className="stripe-form-price">${product.price}</span> per month per user.
				</h4></div>
				<div className="stripe-modal-content-wrapper">
					<StripeProvider apiKey={STRIPE_TEST_TOKEN}>
						<Elements>
							<StripeForm
								submitting={submitting}
								onCancel={()=> this.setState({ outro : true })}
								onError={this.handleError}
								onSubmit={this.handleSubmit}
							/>
						</Elements>
					</StripeProvider>

					<div className="form-disclaimer">
						<NavLink to={Pages.TERMS} onClick={this.handlePage}>Need More details about our Plans?</NavLink>
					</div>
				</div>
				{(submitting) && (<div className="base-overlay-loader-wrapper">
					<div className="base-overlay-loader">
						<FontAwesome name="circle-notch" className="base-overlay-loader-spinner" size="3x" spin />
					</div>
				</div>)}
			</div>
		</BaseOverlay>);
	}
}


const mapStateToProps = (state, ownProps)=> {
  return {
    team     : state.team,
    products : state.products
  };
};

const mapDispatchToProps = (dispatch)=> {
	return ({
		fetchTeamLookup : (payload)=> dispatch(fetchTeamLookup(payload))
	});
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StripeModal));
