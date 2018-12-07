
import React, { Component } from 'react';
import './RadioButton.css';

import { Column, Row } from 'simple-flexbox';

class RadioButton extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentDidMount() {
	}

	render() {
		const buttonClass = (this.props.enabled) ? 'radio-button-button' : 'radio-button-button radio-button-button-disabled button-disabled';
		const titleClass = (this.props.enabled) ? 'radio-button-title' : 'radio-button-title radio-button-title-disabled';
		const subtextClass = (this.props.enabled) ? 'radio-button-subtext' : 'radio-button-subtext radio-button-subtext-disabled';

		return (
			<div className="radio-button"><Row vertical="center">
				<Column vertical="center"><button className={buttonClass} onClick={()=> (this.props.enabled) ? this.props.onClick() : null}>
					{(this.props.selected) && (<img className="radio-button-image" src="/images/radio-button_selected.png" alt={this.props.title} />)}
				</button></Column>
				<Column vertical="center"><div className={titleClass}>{this.props.title}</div></Column></Row>
				<div className={subtextClass}>{this.props.subtext}</div>
			</div>
		);
	}
}

export default RadioButton;
