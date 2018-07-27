
import React, { Component } from 'react';
import './TextForm';

import InputField from '../InputField';


class TextForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form : {
				email        : 'matt@modd.live',
				title        : 'aaa',
				headline     : 'bbb',
				subheadline  : 'ccc',
				mainHeadline : 'ddd',
				colors       : '',
				cornerType   : 1,
				imagery      : ''
			}
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

		} else if (event.target.name === 'txt-headline') {
			if (this.state.form.headline.length <= 250) {
				form.headline = event.target.value;
			}

		} else if (event.target.name === 'txt-subheadline') {
			if (this.state.form.subheadline.length <= 80) {
				form.subheadline = event.target.value;
			}

		} else if (event.target.name === 'txt-main-headline') {
			if (this.state.form.mainHeadline.length <= 250) {
				form.mainHeadline = event.target.value;
			}
		}

		this.setState({ form : form });
		this.props.onChange(form);
	}

	render() {
		return (
			<div style={{width:'100%', textAlign:'left'}}>
				<div className="input-title">Details</div>
				<InputField
					type="text"
					name="txt-title"
					placeholder="Project name"
					value={this.state.form.title}
					onChange={(event)=> this.handleTextChange(event)} />

				<InputField
					type="email"
					name="txt-email"
					placeholder="Email address"
					value={this.state.form.email}
					onChange={(event)=> this.handleTextChange(event)} />

				<div className="input-title">Message</div>
				<div className="form-element"><input className="textfield-input" type="text" name="txt-headline" placeholder="“Large headline”" value={this.state.form.headline} onChange={this.handleTextChange} style={{fontSize:'48px', borderBottom:'none'}} /></div>
				<div className="form-element"><input className="textfield-input" type="text" name="txt-subheadline" placeholder="“Medium Headline”" value={this.state.form.subheadline} onChange={this.handleTextChange} style={{fontSize:'30px', borderBottom:'none'}} /></div>
				<div className="form-element"><input className="textfield-input" type="text" name="txt-main-headline" placeholder="“Call To Action”" value={this.state.form.mainHeadline} onChange={this.handleTextChange} style={{fontSize:'22px', borderBottom:'none'}} /></div>
			</div>
		);
	}
}

export default TextForm;
