
import React, { Component } from 'react';
import './Tooltip.css'

import { TimelineMax, Elastic, Power1 } from "gsap/TweenMax";

class Tooltip extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.contentWrapper = null;
		this.tail1Wrapper = null;
		this.tail2Wrapper = null;
		this.tail3Wrapper = null;
		this.tail4Wrapper = null;
		this.timeline = null;
	}

	componentDidMount() {
		this.timeline = new TimelineMax();
		this.timeline.staggerFrom([this.contentWrapper, this.tail1Wrapper, this.tail2Wrapper, this.tail3Wrapper, this.tail4Wrapper], 2.5, {
			y       : '+25px',
			opacity : 0,
			delay   : 0,
			ease    : Elastic.easeOut
		}, 0.125);

		this.timeline.staggerTo([this.tail4Wrapper, this.tail3Wrapper, this.tail2Wrapper, this.tail1Wrapper], 0.25, {
			opacity : 0,
			delay   : 0,
			ease    : Power1.easeIn
		}, 0.125);
	}

	componentWillUnmount() {
		this.contentWrapper = null;
		this.tail1Wrapper = null;
		this.tail2Wrapper = null;
		this.tail3Wrapper = null;
		this.timeline = null;
	}

	render() {
// 		const wrapperStyle = {
// 			width : this.contentWrapper.clientWidth
// 		};

		const bgStyle = {
			backgroundColor : (this.props.content.txt === 'Design Engine is ready.') ? '#61a913' : (this.props.content.txt === 'Design Engine is shutting down.' || this.props.content.txt === 'Design Engine has stopped.') ? '#ff4b61' : '#002fff'
		};

		if (this.timeline && this.props.content.isAnimated) {
			this.timeline.restart();
		}

		return (
			<div className="tooltip-wrapper" ref={div=> this.contentWrapper = div}>
				<div className="tooltip-tail tooltip-tail-4" style={bgStyle} ref={div=> this.tail4Wrapper = div} />
				<div className="tooltip-tail tooltip-tail-3" style={bgStyle} ref={div=> this.tail3Wrapper = div} />
				<div className="tooltip-tail tooltip-tail-2" style={bgStyle} ref={div=> this.tail2Wrapper = div} />
				<div className="tooltip-tail tooltip-tail-1" style={bgStyle} ref={div=> this.tail1Wrapper = div} />
				<div className="tooltip-content" style={bgStyle} ref={div=> this.contentWrapper = div}>
					<div className="tooltip-text">{this.props.content.txt}</div>
				</div>
			</div>
		);
	}
}

export default Tooltip;
