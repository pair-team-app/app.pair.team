
import React, { Component } from 'react';
import './StripeForm.css'

import { CardCVCElement, CardExpiryElement, CardNumberElement, injectStripe } from 'react-stripe-elements';
import { trackEvent } from '../../../utils/tracking';


const createElementOptions = ()=> ({
	style : {
		base    : {
			color           : 'var(--site-fg-color)',
			'::placeholder' : { color : '#727d8d' }
		},
		invalid : {
			color : '#ff4646'
		},
		complete : {
			color : '#7ed916'
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

	handleCancel = (event)=> {
// 		console.log('%s.handleCancel()', this.constructor.name, event);

		event.preventDefault();
		trackEvent('button', 'purchase-cancel');

		this.props.onCancel();
	};

	handleChange = (target)=> {
// 		console.log('%s.handleChange()', this.constructor.name, target);
		this.setState({ [target.name] : target.value });
	};

	handleFocus = (event)=> {
// 		console.log('%s.handleFocus()', this.constructor.name, event);
		this.setState({
			cardHolder      : '',
			cardHolderValid : true
		});
	};

	handleSubmit = (event)=> {
// 		console.log('%s.handleSubmit()', this.constructor.name, event);

		event.preventDefault();
		trackEvent('button', 'purchase-submit');

		const { cardHolder } = this.state;
		if (cardHolder.length > 0) {
			this.props.stripe.createToken({ name : cardHolder }).then((result)=> {
				const { error, token } = result;
				trackEvent('purchase', (error) ? `error-${error}` : 'success');

				if (error) {
					this.props.onError(error);

				} else {
					this.props.onSubmit({ cardHolder, token });
				}
			});
		}
	};


	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);

		const { submitting } = this.props;
		const { cardHolder } = this.state;
		return (<div className="stripe-form">
			<form onSubmit={this.handleSubmit} method="post">
				<div className="stripe-form-element-wrapper">
					<input type="text" name="cardHolder" placeholder="Card Holder" value={cardHolder} onFocus={this.handleFocus} onChange={(event)=> this.handleChange(event.target)} style={{ textAlign : 'left' }} autoComplete="off" autoFocus />
					<CardNumberElement className="input-txt" {...createElementOptions()} />
					<CardExpiryElement className="input-txt" {...createElementOptions()} />
					<CardCVCElement className="input-txt"  {...createElementOptions()} />
				</div>

				<div className="button-wrapper-col stripe-form-button-wrapper">
					<button onClick={this.handleCancel}>Cancel</button>
					<button disabled={(cardHolder.length === 0 || submitting)} type="submit">Submit</button>
				</div>
			</form>
		</div>);
	}
}


// const StripeLogo = ()=> {
// 	return (<div className="stripe-form-logo" onClick={(event)=> window.open('https://www.stripe.com')}>
// 		<svg width="149px" height="41px">
// 			<path fillRule="evenodd" fill="rgb(50, 54, 78)" d="M6.000,-0.000 L143.000,-0.000 C146.314,-0.000 149.000,2.686 149.000,6.000 L149.000,35.000 C149.000,38.314 146.314,41.000 143.000,41.000 L6.000,41.000 C2.686,41.000 -0.000,38.314 -0.000,35.000 L-0.000,6.000 C-0.000,2.686 2.686,-0.000 6.000,-0.000 Z" />
// 			<path fillRule="evenodd" fill="rgb(255, 255, 255)" d="M71.403,26.625 L69.941,26.625 L71.073,23.829 L68.820,18.144 L70.365,18.144 L71.781,22.013 L73.208,18.144 L74.753,18.144 L71.403,26.625 ZM65.788,24.183 C65.281,24.183 64.762,23.995 64.290,23.629 L64.290,24.042 L62.781,24.042 L62.781,15.561 L64.290,15.561 L64.290,18.546 C64.762,18.192 65.281,18.003 65.788,18.003 C67.369,18.003 68.454,19.277 68.454,21.093 C68.454,22.909 67.369,24.183 65.788,24.183 ZM65.470,19.300 C65.057,19.300 64.644,19.477 64.290,19.831 L64.290,22.355 C64.644,22.709 65.057,22.886 65.470,22.886 C66.319,22.886 66.909,22.155 66.909,21.093 C66.909,20.032 66.319,19.300 65.470,19.300 ZM56.670,23.629 C56.210,23.995 55.691,24.183 55.172,24.183 C53.603,24.183 52.507,22.909 52.507,21.093 C52.507,19.277 53.603,18.003 55.172,18.003 C55.691,18.003 56.210,18.192 56.670,18.546 L56.670,15.561 L58.192,15.561 L58.192,24.042 L56.670,24.042 L56.670,23.629 ZM56.670,19.831 C56.328,19.477 55.915,19.300 55.502,19.300 C54.641,19.300 54.052,20.032 54.052,21.093 C54.052,22.155 54.641,22.886 55.502,22.886 C55.915,22.886 56.328,22.709 56.670,22.355 L56.670,19.831 ZM47.682,21.506 C47.776,22.402 48.484,23.016 49.475,23.016 C50.017,23.016 50.619,22.815 51.232,22.461 L51.232,23.723 C50.560,24.030 49.888,24.183 49.227,24.183 C47.446,24.183 46.196,22.886 46.196,21.046 C46.196,19.265 47.423,18.003 49.109,18.003 C50.654,18.003 51.704,19.218 51.704,20.952 C51.704,21.117 51.704,21.305 51.680,21.506 L47.682,21.506 ZM49.050,19.171 C48.319,19.171 47.753,19.713 47.682,20.527 L50.253,20.527 C50.206,19.725 49.722,19.171 49.050,19.171 ZM43.707,20.102 L43.707,24.042 L42.197,24.042 L42.197,18.144 L43.707,18.144 L43.707,18.734 C44.131,18.262 44.650,18.003 45.157,18.003 C45.323,18.003 45.488,18.015 45.653,18.062 L45.653,19.407 C45.488,19.359 45.299,19.336 45.122,19.336 C44.627,19.336 44.096,19.607 43.707,20.102 ZM36.971,21.506 C37.066,22.402 37.773,23.016 38.764,23.016 C39.307,23.016 39.908,22.815 40.522,22.461 L40.522,23.723 C39.849,24.030 39.177,24.183 38.516,24.183 C36.735,24.183 35.485,22.886 35.485,21.046 C35.485,19.265 36.712,18.003 38.398,18.003 C39.944,18.003 40.993,19.218 40.993,20.952 C40.993,21.117 40.993,21.305 40.970,21.506 L36.971,21.506 ZM38.339,19.171 C37.608,19.171 37.042,19.713 36.971,20.527 L39.543,20.527 C39.495,19.725 39.012,19.171 38.339,19.171 ZM31.698,24.042 L30.495,20.032 L29.304,24.042 L27.947,24.042 L25.919,18.144 L27.428,18.144 L28.620,22.155 L29.811,18.144 L31.179,18.144 L32.370,22.155 L33.562,18.144 L35.071,18.144 L33.054,24.042 L31.698,24.042 ZM22.474,24.183 C20.693,24.183 19.431,22.898 19.431,21.093 C19.431,19.277 20.693,18.003 22.474,18.003 C24.255,18.003 25.505,19.277 25.505,21.093 C25.505,22.898 24.255,24.183 22.474,24.183 ZM22.474,19.265 C21.589,19.265 20.976,20.008 20.976,21.093 C20.976,22.178 21.589,22.921 22.474,22.921 C23.347,22.921 23.960,22.178 23.960,21.093 C23.960,20.008 23.347,19.265 22.474,19.265 ZM15.845,21.129 L14.488,21.129 L14.488,24.042 L12.979,24.042 L12.979,15.927 L15.845,15.927 C17.496,15.927 18.675,17.000 18.675,18.534 C18.675,20.067 17.496,21.129 15.845,21.129 ZM15.632,17.154 L14.488,17.154 L14.488,19.902 L15.632,19.902 C16.505,19.902 17.118,19.348 17.118,18.534 C17.118,17.708 16.505,17.154 15.632,17.154 Z" />
// 			<path fillRule="evenodd" fill="rgb(255, 255, 255)" d="M136.827,21.868 L129.577,21.868 C129.742,23.604 131.014,24.115 132.457,24.115 C133.928,24.115 135.086,23.806 136.096,23.296 L136.096,26.280 C135.089,26.837 133.761,27.240 131.990,27.240 C128.383,27.240 125.855,24.981 125.855,20.514 C125.855,16.742 127.999,13.746 131.523,13.746 C135.041,13.746 136.877,16.741 136.877,20.534 C136.877,20.892 136.844,21.668 136.827,21.868 ZM131.499,16.766 C130.573,16.766 129.544,17.465 129.544,19.134 L133.373,19.134 C133.373,17.467 132.409,16.766 131.499,16.766 ZM119.981,27.240 C118.685,27.240 117.893,26.693 117.361,26.303 L117.353,30.494 L113.650,31.282 L113.648,13.993 L116.910,13.993 L117.102,14.908 C117.615,14.429 118.552,13.746 120.004,13.746 C122.605,13.746 125.055,16.089 125.055,20.401 C125.055,25.108 122.631,27.240 119.981,27.240 ZM119.119,17.027 C118.268,17.027 117.736,17.338 117.350,17.761 L117.372,23.265 C117.731,23.654 118.250,23.968 119.119,23.968 C120.488,23.968 121.406,22.477 121.406,20.483 C121.406,18.545 120.474,17.027 119.119,17.027 ZM108.417,13.993 L112.135,13.993 L112.135,26.975 L108.417,26.975 L108.417,13.993 ZM108.417,9.848 L112.135,9.057 L112.135,12.074 L108.417,12.864 L108.417,9.848 ZM104.576,18.174 L104.576,26.975 L100.874,26.975 L100.874,13.993 L104.076,13.993 L104.309,15.088 C105.175,13.494 106.907,13.817 107.400,13.994 L107.400,17.398 C106.929,17.246 105.451,17.024 104.576,18.174 ZM96.759,22.420 C96.759,24.603 99.096,23.924 99.571,23.734 L99.571,26.749 C99.077,27.020 98.182,27.240 96.971,27.240 C94.773,27.240 93.124,25.621 93.124,23.428 L93.140,11.545 L96.756,10.777 L96.759,13.993 L99.572,13.993 L99.572,17.151 L96.759,17.151 L96.759,22.420 ZM92.265,23.052 C92.265,25.718 90.143,27.240 87.063,27.240 C85.786,27.240 84.390,26.992 83.013,26.399 L83.013,22.863 C84.256,23.539 85.840,24.046 87.067,24.046 C87.893,24.046 88.488,23.824 88.488,23.140 C88.488,21.372 82.857,22.038 82.857,17.937 C82.857,15.315 84.860,13.746 87.864,13.746 C89.091,13.746 90.318,13.935 91.545,14.424 L91.545,17.912 C90.418,17.304 88.988,16.959 87.861,16.959 C87.085,16.959 86.603,17.183 86.603,17.762 C86.603,19.428 92.265,18.636 92.265,23.052 Z" />
// 		</svg>
// 	</div>);
// };


export default injectStripe(StripeForm);
