
import React, { Component } from 'react';
import './RadioButton.css';

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
			<div className="radio-button">
				<button className={buttonClass} onClick={()=> (this.props.enabled) ? this.props.onClick() : null}><img className="radio-button-image" src={(this.props.selected) ? '/images/radio-button_selected.svg' : '/images/radio-button.svg'} alt="Radio" /></button>
				<span className={titleClass}>{this.props.title}</span>
				<div className={subtextClass}>{this.props.subtext}</div>
			</div>
		);
	}
}

export default RadioButton;
