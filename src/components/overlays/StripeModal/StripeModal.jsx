
import React, { Component } from 'react';
import './StripeModal.css';

import axios from 'axios';
import { Strings, URIs } from 'lang-js-utils';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { Elements, StripeProvider } from 'react-stripe-elements';

import BaseOverlay from '../BaseOverlay';
import StripeForm from '../../forms/StripeForm/StripeForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL, Pages } from '../../../consts/uris';
import { trackEvent } from '../../../utils/tracking';
import stripeCreds from '../../../assets/json/stripe-creds';
import { fetchTeamLookup } from '../../../redux/actions';


const STRIPE_TEST_TOKEN = stripeCreds.test.publish;
// const STRIPE_LIVE_TOKEN = stripeCreds.live.publish;



class StripeModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			submitting : false,
			approved   : false,
			outro      : false,
			outroURI   : null,
			purchase   : null,
			productIDs : Strings.repeat((this.props.payload.price === 14.99) ? 3 : 4, this.props.payload.total, ',')
		};
	}

	handleComplete = ()=> {
// 		console.log('%s.handleComplete()', this.constructor.name);

		this.setState({ outro : false }, ()=> {
			const { approved, purchase, outroURI } = this.state;
			if (approved) {
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
		console.log('%s.handleError()', this.constructor.name, error);

		this.props.onPopup({
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_ERROR,
			content  : error.code
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

		const { profile, payload } = this.props;
		const { productIDs } = this.state;

		this.setState({ submitting : true });

		axios.post(API_ENDPT_URL, {
			action  : 'MAKE_PURCHASE',
			payload : {
				user_id     : profile.id,
				team_id     : payload.teamID,
				token_id    : token.id,
				product_ids : productIDs
			}
		}).then((response) => {
			console.log('MAKE_PURCHASE', response.data);
			const { purchase, error } = response.data;
			trackEvent('purchase', (error) ? 'error' : 'success');

			if ((purchase.id << 0) === 0) {
				this.props.onPopup({
					position : POPUP_POSITION_TOPMOST,
					type     : POPUP_TYPE_ERROR,
					content  : error.code
				});
			}

			this.setState({
				submitting : false,
				approved   : ((purchase.id << 0) > 0),
				outro      : ((purchase.id << 0) > 0),
				purchase   : purchase
			});

		}).catch((error)=> {
		});
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { price, total } = this.props.payload;
		const { outro } = this.state;
		return (<BaseOverlay
			tracking={`stripe/${URIs.firstComponent()}`}
			outro={outro}
			closeable={true}
			defaultButton={null}
			title={null}
			onComplete={this.handleComplete}>

			<div className="stripe-modal">
				<div className="stripe-modal-header-wrapper"><h4>
					Your domain has reached {total} users.<br />
					To continue using Pair, please sign up<br />
					for <span className="stripe-form-price">${price}</span> per month per user.
				</h4></div>
				<div className="stripe-modal-content-wrapper">
					<StripeProvider apiKey={STRIPE_TEST_TOKEN}>
						<Elements>
							<StripeForm
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
			</div>
		</BaseOverlay>);
	}
}


const mapDispatchToProps = (dispatch)=> {
	return ({
		fetchTeamLookup : (payload)=> dispatch(fetchTeamLookup(payload))
	});
};


export default withRouter(connect(null, mapDispatchToProps)(StripeModal));
