
import React, { Component } from 'react';
import './TitleForm.css';

import { Column, Row } from 'simple-flexbox';

import AIStatus from '../elements/AIStatus';
import InputField from '../InputField';


class TitleForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			status : {
				isVisible : false,
				content   : '',
				coords    : {
					x : 0,
					y : 0
				}
			},
			form : {
				email : '',
				title : ''
			},
			isValidated : false
		};

		this.isEmailValidated = false;
		this.isTitleValidated = false;

		this.handleTextChange = this.handleTextChange.bind(this);
	}


	handleTextChange(event) {
		let form = this.state.form;

		//this.setState({ [event.target.name] : event.target.value });
		if (event.target.name === 'txt-email') {
			form.email =  event.target.value;

		} else if (event.target.name === 'txt-title') {
			if (this.state.form.title.length <= 40) {
				form.title = event.target.value;
			}
		}

		let validated = 0x00;

		let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (re.test(String(form.email).toLowerCase())) {
			if (!this.isEmailValidated) {
				this.isEmailValidated = true;
				this.props.onTooltip({
					ico : '📧',
					txt : 'Email looks valid, sweet.'
				});
			}
			validated |= 0x01;

		} else {
			this.isEmailValidated = false;
		}

		if (form.title.length > 0) {
			if (!this.isTitleValidated) {
				this.isTitleValidated = true;
				this.props.onTooltip({
					ico : '👍',
					txt : 'Name looks great.'
				});
			}
			validated |= 0x10;

		} else {
			this.isTitleValidated = false;
		}

		this.setState({
			form : form,
			isValidated : (validated === 0x11)
		});
	}

	handleTooltip(name) {
		console.log("handleTooltip");
	}

	handleClick() {
		if (this.state.isValidated) {
			this.props.onNext(this.state.form);
		}
	}

	render() {
		const btnClass = (this.state.isValidated) ? 'form-button' : 'form-button form-button-disabled';

		return (
			<div style={{width:'100%'}}>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Email &amp; company name</div>
						<div className="input-title">Enter your email &amp; company name.</div>
					</Column>
				</Row>
				<Row horizontal="center">
					<button className="form-button form-button-secondary" onClick={()=> this.props.onBack()}>Back</button>
					<button className={btnClass} onClick={()=> this.handleClick()}>Next</button>
				</Row>
				<Row vertical="start">
					<div style={{width:'100%'}}>
						<InputField
							type="email"
							name="txt-email"
							placeholder="Enter a work email address"
							value={this.state.form.email}
							onChange={(event)=> this.handleTextChange(event)}
							onClick={(name)=> this.handleTooltip(name)} />

						<InputField
							type="text"
							name="txt-title"
							placeholder="Enter your company or brand's name"
							value={this.state.form.title}
							onChange={(event)=> this.handleTextChange(event)}
							onClick={(name)=> this.handleTooltip(name)} />
					</div>
				</Row>
				<Row horizontal="center" className="disclaimer-form">
					By tapping “Next” you agree to Design<br />Engine's Terms of Service
				</Row>

				{this.state.status.isVisible && (
					<AIStatus content={this.state.status.content} coords={this.state.status.coords} />
				)}
			</div>
		);
	}
}

export default TitleForm;
