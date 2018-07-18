
import React, { Component } from 'react';
import './DetailsStep.css';

import { Column, Row } from 'simple-flexbox';


class DetailsStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email : '',
			company : '',
			description : '',
			headline : '',
			subheadline : ''
		};

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
		console.log("handleChange("+event.target.value+")");

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

		} else if (event.target.name === 'txt-headline') {
			if (this.state.headline.length <= 80) {
				this.setState({ headline : event.target.value });
			}

		} else if (event.target.name === 'txt-subheadline') {
			if (this.state.subheadline.length <= 40) {
				this.setState({ subheadline : event.target.value });
			}
		}
	}

	render() {
		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="intro-text">Enter your details</div>
					<div className="form-element"><input className="textfield-input" type="text" name="txt-email" placeholder="Enter Email" value={this.state.email} onChange={this.handleChange} /></div>
					<div className="form-element"><input className="textfield-input" type="text" name="txt-company" placeholder="Company Name" value={this.state.company} onChange={this.handleChange} /></div>
					<div className="form-element"><textarea className="textfield-input" name="txt-description" placeholder="Company Description" value={this.state.description} onChange={this.handleChange} /></div>
					<div className="form-element"><input className="textfield-input" type="text" name="txt-headline" placeholder="Product Headline" value={this.state.headline} onChange={this.handleChange} /></div>
					<div className="form-element"><input className="textfield-input" type="text" name="txt-subheadline" placeholder="Product Sub Headline" value={this.state.subHeadline} onChange={this.handleChange} /></div>
					<button className="action-button intro-button" onClick={()=> this.props.onClick(this.state)}>Next</button>
				</Column>
			</Row>
		);
	}
}

export default DetailsStep;
