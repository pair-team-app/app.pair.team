
import React, { Component } from 'react';
import './DetailsStep.css';

import { Column, Row } from 'simple-flexbox';

import InputField from './InputField'


class DetailsStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email : '',
			company : '',
			description : '',
			product : '',
			info : '',
			headline : '',
			subheadline : '',
			isValidated : false
		};

		this.handleChange = this.handleChange.bind(this);
	}

	validator() {
		let validated = 0x0000000;

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(String(this.state.email).toLowerCase())) {
			validated |= 0x0000001;
		}

		if (this.state.company.length > 0) {
			validated |= 0x0000010;
		}

		if (this.state.description.length > 0) {
			validated |= 0x0000100;
		}

		if (this.state.product.length > 0) {
			validated |= 0x0001000;
		}

		if (this.state.info.length > 0) {
			validated |= 0x0010000;
		}

		if (this.state.headline.length > 0) {
			validated |= 0x0100000;
		}

		if (this.state.subheadline.length > 0) {
			validated |= 0x1000000;
		}

		return (validated);
	}

	handleChange(event) {

		//this.setState({ [event.target.name] : event.target.value });
		if (event.target.name === 'txt-email') {
			this.setState({ email : event.target.value });

		} else if (event.target.name === 'txt-company') {
			if (this.state.company.length <= 40) {
				this.setState({ company : event.target.value });
			}

		} else if (event.target.name === 'txt-description') {
			if (this.state.description.length <= 250) {
				this.setState({ description : event.target.value });
			}

		} else if (event.target.name === 'txt-product') {
			if (this.state.product.length <= 80) {
				this.setState({ product : event.target.value });
			}

		} else if (event.target.name === 'txt-info') {
			if (this.state.info.length <= 250) {
				this.setState({ info : event.target.value });
			}

		} else if (event.target.name === 'txt-headline') {
			if (this.state.headline.length <= 80) {
				this.setState({ headline : event.target.value });
			}

		} else if (event.target.name === 'txt-subheadline') {
			if (this.state.subheadline.length <= 40) {
				this.setState({ subheadline : event.target.value });
			}
		}

		this.setState({ isValidated : (this.validator() === 0x1111111) });
	}

	handleClick() {
		let validated = this.validator();
		if (validated === 0x1111111) {
			this.props.onClick(this.state);
		}
	}

	render() {
		let buttonClass = (this.state.isValidated) ? 'action-button full-button' : 'action-button full-button disabled-button';
		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Add your deisgn details</div>
						<div className="step-text">Add details to your project for Design Engine to generating your files.</div>
						<button className={buttonClass} onClick={()=> this.handleClick()}>Next</button>
						<div className="step-text">By clicking “Next” I agree to Design Engine’s Terms of Service.</div>
					</Column>
				</Row>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="start">
						<div className="step-subheader-text">Enter Design Details</div>
						<div className="step-text">Enter your product details below to generate your AI designs.</div>
						<InputField
							type="email"
							name="txt-email"
							placeholder="Email Address"
							value={this.state.email}
							onChange={(event)=> this.handleChange(event)} />

						<InputField
							type="text"
							name="txt-company"
							placeholder="Company Name"
							value={this.state.company}
							onChange={(event)=> this.handleChange(event)} />

						<InputField
							type="text"
							name="txt-description"
							placeholder="Company Description"
							value={this.state.description}
							onChange={(event)=> this.handleChange(event)} />

						<InputField
							type="text"
							name="txt-product"
							placeholder="Product Name"
							value={this.state.product}
							onChange={(event)=> this.handleChange(event)} />

						<InputField
							type="text"
							name="txt-info"
							placeholder="Product Description"
							value={this.state.info}
							onChange={(event)=> this.handleChange(event)} />

						<InputField
							type="text"
							name="txt-headline"
							placeholder="Product Headline"
							value={this.state.headline}
							onChange={(event)=> this.handleChange(event)} />

						<InputField
							type="text"
							name="txt-subheadline"
							placeholder="Product Sub Headline"
							value={this.state.subheadline}
							onChange={(event)=> this.handleChange(event)} />

						<div style={{backgroundColor:'#e0e0e0', width:'100%'}}>Drag images here</div>

					</Column>
				</Row>
			</div>
		);
	}
}

export default DetailsStep;
