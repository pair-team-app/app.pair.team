
import React, { Component } from 'react';
import './InputField.css';


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
		return (
			<div className="form-element">
				<input className="textfield-input" type={(this.props.type === 'password') ? 'password' : 'text'} name={this.props.name} placeholder={this.props.placeholder} value={this.props.value} onChange={this.handleChange} />
				{/*<div className="input-tip input-tip-red" onClick={()=> this.props.onClick('title')}>Required</div>*/}
			</div>
		);
	}
}

export default InputField;
