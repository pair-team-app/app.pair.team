
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
		if (this.timeline && this.props.content.isAnimated) {
			this.timeline.restart();
		}

		return (
			<div className="tooltip-wrapper">
				<div className="tooltip-tail tooltip-tail-4" ref={div=> this.tail4Wrapper = div} />
				<div className="tooltip-tail tooltip-tail-3" ref={div=> this.tail3Wrapper = div} />
				<div className="tooltip-tail tooltip-tail-2" ref={div=> this.tail2Wrapper = div} />
				<div className="tooltip-tail tooltip-tail-1" ref={div=> this.tail1Wrapper = div} />
				<div className="tooltip-content" ref={div=> this.contentWrapper = div}>
					<div className="tooltip-text">{this.props.content.txt}</div>
				</div>
			</div>
		);
	}
}

export default Tooltip;
