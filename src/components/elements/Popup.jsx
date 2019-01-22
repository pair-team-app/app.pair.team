
import React, { Component } from 'react';
import './Popup.css'

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import FontAwesome from 'react-fontawesome';
import { Row } from 'simple-flexbox';

const START_LBL = 'START';
const END_LBL = 'END';


class Popup extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.wrapper = null;
	}

	componentDidMount() {
// 		console.log('Popup.componentDidMount()', this.props, this.state);

		const { payload, onComplete } = this.props;

		this.timeline = new TimelineMax();
		this.timeline.addLabel(START_LBL, '0').from(this.wrapper, 0.125, {
			opacity    : 0.25,
			y          : '+1px',
			ease       : Power1.easeIn

		}).to(this.wrapper, 0.75, {
			opacity    : 0,
			y          : '-30px',
			ease       : Power2.easeOut,
			delay      : (payload.duration) ? payload.duration * 0.001 : 1.125,
			onComplete : onComplete
		}).addLabel(END_LBL);
	}

	componentWillUnmount() {
		this.timeline = null;
	}

	render() {
		console.log('Popup.render()', this.props, this.state, this.timeline);

		if (this.timeline && !this.timeline.isActive()) {
			this.timeline.restart();
		}

		const { payload } = this.props;
		const icon = (payload.type === 'ERROR') ? 'exclamation' : 'info';

		return (
			<div className="popup-wrapper" ref={(element)=> { this.wrapper = element; }}>
				<Row vertical="center">
					<FontAwesome name={icon} className="popup-icon" />
					<div className="popup-content">{payload.content}</div>
				</Row>
			</div>
		);
	}
}

export default Popup;
