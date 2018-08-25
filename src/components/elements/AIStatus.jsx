
import React, { Component } from 'react';
import './AIStatus.css';

import { TweenMax, Expo } from "gsap/TweenMax";

class AIStatus extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.divWrapper = null;
	}

	componentDidMount() {
		let tween = TweenMax.to(this.divWrapper, 1, {
			opacity : 0,
			ease    : Expo.easeOut,
			delay   : 1.5
		});
	}

	componentWillUnmount() {
		let tween = TweenMax.to(this.divWrapper, 0.01, {
			opacity : 1,
			ease    : Expo.easeOut
		});
	}

	render() {
		const style = {
		};

		return (
			<div className="ai-status" style={style} ref={div=> this.divWrapper = div}>
				<div className="ai-status-text">{this.props.content}</div>
			</div>
		);
	}
}

export default AIStatus;
