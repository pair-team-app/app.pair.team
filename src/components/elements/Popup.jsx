
import React, { Component } from 'react';
import './Popup.css'

import { TimelineMax, Power1, Power2 } from "gsap/TweenMax";
import { Column, Row } from 'simple-flexbox';

class Popup extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.wrapper = null;
	}

	componentDidMount() {
		let self = this;
// 		TweenMax.to(this.wrapper, 0.75, {
// 			opacity    : 0,
// 			y          : '-20px',
// 			ease       : Power2.easeOut,
// 			delay      : 1.125,
// 			onComplete : self.props.onComplete
// 		});

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, 0.25, {
			opacity    : 0,
			ease       : Power1.easeIn

		}).to(this.wrapper, 0.75, {
			opacity    : 0,
			y          : '-30px',
			ease       : Power2.easeOut,
			delay      : 1,
			onComplete : self.props.onComplete
		});
	}

	componentWillUnmount() {
		this.timeline = null;
	}


	render() {
		if (this.timeline) {
			this.timeline.restart();
		}


		const icon = (this.props.content.split('::')[0] === 'error') ? '/images/icon-error.png' : '/images/copy-code.svg';

		return (
			<div className="popup-wrapper" ref={(div)=> this.wrapper = div}>
				<Row>
					<Column><img src={icon} className="popup-icon" alt={this.props.content.split('::')[0]} /></Column>
					<Column className="popup-content">
						<Row vertical="center" className="popup-text">{this.props.content.split('::').pop()}</Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default Popup;