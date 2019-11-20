
import React, { Component } from 'react';
import './StripeModal.css';

import axios from 'axios';
import { URIs } from 'lang-js-utils';
import { NavLink, withRouter } from 'react-router-dom';
import { Elements, StripeProvider } from 'react-stripe-elements';

import BaseOverlay from '../BaseOverlay';
import StripeForm from '../../forms/StripeForm/StripeForm';
import { POPUP_POSITION_TOPMOST, POPUP_TYPE_ERROR, POPUP_TYPE_OK } from '../PopupNotification';
import { API_ENDPT_URL, Pages } from '../../../consts/uris';
import { sendToSlack } from '../../../utils/funcs';
import { trackEvent } from '../../../utils/tracking';
import stripeCreds from '../../../assets/json/stripe-creds';


const STRIPE_TEST_TOKEN = stripeCreds.test.publish;
// const STRIPE_LIVE_TOKEN = stripeCreds.live.publish;


const PRODUCT_IDS = [3];


class StripeModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			submitting : false,
			approved   : false,
			outro      : false,
			outroURI   : null,
			purchase   : null,
			total      : 10,
			price      : 14.99
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

	handleSubmit = (cardHolder, token)=> {
// 		console.log('%s.handleSubmit()', this.constructor.name, cardHolder, token, this.state);

		const { profile } = this.props;
		this.setState({ submitting : true });

		axios.post(API_ENDPT_URL, {
			action  : 'MAKE_PURCHASE',
			payload : {
				user_id     : profile.id,
				token_id    : token.id,
				product_ids : PRODUCT_IDS.join(',')
			}
		}).then((response) => {
			console.log('MAKE_PURCHASE', response.data);
			const { purchase, error } = response.data;
			trackEvent('purchase', (error) ? 'error' : 'success');

			if ((purchase.id << 0) > 0) {
				sendToSlack(`*[\`${profile.id}\`]* *${profile.email}* purchased "_${'Standard User'}_" for \`$${14.99}\``);

				this.props.onPopup({
					type    : POPUP_TYPE_OK,
					content : 'Payment Processed!!'
				});

			} else {
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

		const { outro, userTotal, price } = this.state;
		return (
			<BaseOverlay
				tracking={`stripe/${URIs.firstComponent()}`}
				outro={outro}
				closeable={true}
				defaultButton={null}
				title={null}
				onComplete={this.handleComplete}>

				<div className="stripe-modal">
					<div className="stripe-modal-header-wrapper"><h4>
						Your domain has reached {userTotal} users.<br />
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
									onPage={this.handlePage}
								/>
							</Elements>
						</StripeProvider>

						<div className="form-disclaimer">
							<NavLink to={Pages.TERMS} onClick={this.handlePage}>Need More details about our <br />Plans?</NavLink>
						</div>
					</div>
				</div>
			</BaseOverlay>);
	}
}


export default withRouter(StripeModal);
