
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
		// eslint-disable-next-line
		let tween = TweenMax.to(this.divWrapper, 2, {
			y       : '-15px',
			opacity : 0,
			ease    : Expo.easeOut,
			delay   : 0.125
		});
	}

	componentWillUnmount() {
		// eslint-disable-next-line
		let tween = TweenMax.to(this.divWrapper, 0.01, {
			opacity : 1,
			ease    : Expo.easeIn
		});
	}

	render() {
		const style = {
		};

		return (
			<div className="ai-status" style={style} ref={div=> this.divWrapper = div}>
				<div className="ai-status-main">
					<div className="ai-status-text">{this.props.content}</div>
				</div>
				<div className="ai-status-tail-1" />
				<div className="ai-status-tail-2" />
				<div className="ai-status-tail-3" />
			</div>
		);
	}
}

export default AIStatus;
