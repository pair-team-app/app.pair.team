
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
		const btnClass = (this.state.isValidated) ? 'action-button step-button' : 'action-button step-button disabled-button';

		return (
			<div style={{width:'100%'}} className="debug-border">
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Step 1</div>
						<div className="step-text">What is your email &amp; product name?</div>
					</Column>
				</Row>
				<Row vertical="start">
					<div style={{width:'100%'}}>
						<InputField
							type="text"
							name="txt-title"
							placeholder="Project name"
							value={this.state.form.title}
							onChange={(event)=> this.handleTextChange(event)}
							onClick={(name)=> this.handleTooltip(name)} />

						<InputField
							type="email"
							name="txt-email"
							placeholder="Email address"
							value={this.state.form.email}
							onChange={(event)=> this.handleTextChange(event)}
							onClick={(name)=> this.handleTooltip(name)} />

						<button className={btnClass} onClick={()=> this.handleClick()}>Next Step</button>

						{/*<div className="input-title">In 2 or more sentences, describe your design</div>*/}
						{/*<div className="form-element">*/}
						{/*<textarea className="textfield-input" name="txt-description" placeholder="“Describe what you would like your design to look like”" value={this.state.form.description} onChange={this.handleTextChange} rows="4" />*/}
						{/*<div className="input-tip input-tip-green" onClick={()=> this.handleTooltip('headline')}>What is This?</div>*/}
						{/*</div>*/}
					</div>
				</Row>
			</div>
		);
	}
}

export default TitleForm;
