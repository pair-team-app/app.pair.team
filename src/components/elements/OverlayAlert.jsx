
import React, { Component } from 'react';
import './OverlayAlert.css';


class OverlayAlert extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		return (
			<div className="overlay-wrapper" onKeyDown={()=> this.onKeyDown()}>
				<div className="overlay-container">
					<div className="overlay-title">{this.props.title}</div>
					<div className="overlay-content" ref={(element) => { this.contentElement = element; }}>
						{this.props.content}
					</div>
					{/*<button className="action-button overlay-button overlay-button-red" onClick={()=> this.props.onCancel()}>Close</button>*/}
					<button className="action-button overlay-button overlay-button-blue" onClick={()=> this.props.onConfirm()}>Continue</button>
				</div>
			</div>
		);
	}
}

export default OverlayAlert;
