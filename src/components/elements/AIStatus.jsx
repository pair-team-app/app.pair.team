
import React, { Component } from 'react';
import './AIStatus.css';

import { TweenMax, Expo } from "gsap/TweenMax";

class AIStatus extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.divWrapper = null;
		this.tween = null;
	}

	componentDidMount() {
		this.tween = TweenMax.to(this.divWrapper, 1, {
			y       : '-15px',
			opacity : 0,
			ease    : Expo.easeOut,
			delay   : this.props.coords.x
		});
	}

	componentWillUnmount() {
		this.tween = null;
// 		// eslint-disable-next-line
// 		let tween = TweenMax.to(this.divWrapper, 0.01, {
// 			opacity : 1,
// 			ease    : Expo.easeIn
// 		});
	}

	render() {
		const style = {
		};

		return (
			<div className="ai-status" style={style} ref={div=> this.divWrapper = div}>
				<div className="ai-status-tail-3" />
				<div className="ai-status-tail-2" />
				<div className="ai-status-tail-1" />
				<div className="ai-status-main">
					<div className="ai-status-text">{this.props.content}</div>
				</div>
			</div>
		);
	}
}

export default AIStatus;
