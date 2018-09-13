
import React, { Component } from 'react';
import './AIStatus.css';

import { TimelineLite, Back, Elastic } from "gsap/TweenMax";

class AIStatus extends Component {
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
		this.timeline = new TimelineLite();
		this.timeline.staggerFrom([this.contentWrapper, this.tail1Wrapper, this.tail2Wrapper, this.tail3Wrapper, this.tail4Wrapper], 1.5, {
			y       : '+10px',
			opacity : 0,
			delay   : 0,
			ease    : Elastic.easeOut
		}, 0.1);
	}

	componentWillUnmount() {
		this.contentWrapper = null;
		this.tail1Wrapper = null;
		this.tail2Wrapper = null;
		this.tail3Wrapper = null;
		this.tail4Wrapper = null;
		this.timeline = null;
	}

	render() {
		if (!this.props.loading && this.timeline) {
			this.timeline.staggerTo([this.contentWrapper, this.tail1Wrapper, this.tail2Wrapper, this.tail3Wrapper, this.tail4Wrapper], 0.75, {
				y       : '-50px',
				opacity : 0,
				delay   : 0,
				ease    : Back.easeIn
			}, 0.1);
		}

		const style = {
			backgroundColor : (this.props.content.toLowerCase().includes('positive')) ? '#61a913' : (this.props.content.toLowerCase().includes('negative')) ? '#bd2626' : (this.props.content.toLowerCase().includes('neutral')) ? '#999999' : '#002fff'
		};

		return (
			<div className="ai-status">
				<div className="ai-status-tail ai-status-tail-4" style={style} ref={div=> this.tail4Wrapper = div} />
				<div className="ai-status-tail ai-status-tail-3" style={style} ref={div=> this.tail3Wrapper = div} />
				<div className="ai-status-tail ai-status-tail-2" style={style} ref={div=> this.tail2Wrapper = div} />
				<div className="ai-status-tail ai-status-tail-1" style={style} ref={div=> this.tail1Wrapper = div} />
				<div className="ai-status-main" style={style} ref={div=> this.contentWrapper = div}>
					<div className="ai-status-text">{(this.props.loading) ? '…' : this.props.content}</div>
				</div>
			</div>
		);
	}
}

export default AIStatus;
