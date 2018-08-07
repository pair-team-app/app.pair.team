
import React, { Component } from 'react';
import './TextForm';

import InputField from '../InputField';


class TextForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			form : {
// 				email        : 'matt@modd.live',
				email        : '',
// 				title        : 'Swap Meets Map',
				title        : '',
// 				description  : 'Find local flea markets in Florida.',
				description  : '',
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

		} else if (event.target.name === 'txt-description') {
			if (this.state.form.description.length <= 250) {
				form.description = event.target.value;
			}
		}

		this.setState({ form : form });
		this.props.onChange(form);
	}

	handleTooltip(name) {
		console.log("handleTooltip");
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
					onChange={(event)=> this.handleTextChange(event)}
					onClick={(name)=> this.handleTooltip(name)} />

				<InputField
					type="email"
					name="txt-email"
					placeholder="Email address"
					value={this.state.form.email}
					onChange={(event)=> this.handleTextChange(event)}
					onClick={(name)=> this.handleTooltip(name)} />

				<div className="input-title">In 2 or more sentences, describe your design</div>
				<div className="form-element">
					<textarea className="textfield-input" name="txt-description" placeholder="“Describe what you would like your design to look like”" value={this.state.form.description} onChange={this.handleTextChange} rows="4" />
					<div className="input-tip input-tip-green" onClick={()=> this.handleTooltip('headline')}>What is This?</div>
				</div>
			</div>
		);
	}
}

export default TextForm;
