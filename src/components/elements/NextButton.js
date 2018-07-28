
import React, { Component } from 'react';
import './NextButton.css'

class NextButton extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		const buttonClass = (this.props.isEnabled) ? 'action-button full-button' : 'action-button full-button disabled-button';
		return (
			<div className="floating-button">
				<button className={buttonClass} onClick={()=> this.props.onClick()}>Next</button>
			</div>
		);
	}
}

export default NextButton;
