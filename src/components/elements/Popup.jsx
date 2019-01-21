
import React, { Component } from 'react';
import './Popup.css'

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import FontAwesome from 'react-fontawesome';
import { Row } from 'simple-flexbox';


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
		this.timeline.from(this.wrapper, 0.25, {
			opacity    : 0,
			ease       : Power1.easeIn

		}).to(this.wrapper, 0.75, {
			opacity    : 0,
			y          : '-30px',
			ease       : Power2.easeOut,
			delay      : (payload.duration) ? payload.duration * 0.001 : 1.125,
			onComplete : onComplete
		});
	}

	componentWillUnmount() {
		this.timeline = null;
	}

	render() {
// 		console.log('Popup.render()', this.props, this.state);

		if (this.timeline) {
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
