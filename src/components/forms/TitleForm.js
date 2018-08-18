
import React, { Component } from 'react';
import './TitleForm.css';

import { Column, Row } from 'simple-flexbox';

import InputField from '../InputField';


class TitleForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form : {
				email : '',
				title : ''
			},
			isValidated : false
		};

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
			validated |= 0x001;
			this.props.onTooltip({
				img : '/images/logo_icon.png',
				txt : 'Email validated, thanks!'
			});
		}

		if (form.title.length > 0) {
			validated |= 0x010;
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
			</div>
		);
	}
}

export default TitleForm;
