
import React, { Component } from 'react';
import './InputField.css';

import FontAwesome from 'react-fontawesome';


class InputField extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isValid : false
		};

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
// 		console.log("handleChange()");

		if (this.props.type === 'email') {
			let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			this.setState({ isValid : (re.test(String(event.target.value).toLowerCase())) });

		} else {
			this.setState({ isValid : (event.target.value.length > 0) });
		}
		this.props.onChange(event);
	}

	render() {
		let glyphStyle = (this.state.isValid) ? 'required-glyph required-glyph-ok' : 'required-glyph';

		return (
			<div className="form-element">
				<input className="textfield-input" type="text" name={this.props.name} placeholder={this.props.placeholder} value={this.props.value} onChange={this.handleChange} />
				<FontAwesome name="star" className={glyphStyle} />
			</div>
		);
	}
}

export default InputField;
