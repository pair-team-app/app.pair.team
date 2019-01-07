
import React, { Component } from 'react';
import './Popup.css'

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import { Column, Row } from 'simple-flexbox';

import { capitalizeText } from '../../utils/funcs';
import errorIcon from '../../images/icon-error.png';
import infoIcon from '../../images/icon-info.svg';

class Popup extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.wrapper = null;
	}

	componentDidMount() {
		console.log('Popup.componentDidMount()', this.props, this.state);

		const { payload, onComplete } = this.props;

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, 0.25, {
			opacity    : 0,
			ease       : Power1.easeIn

		}).to(this.wrapper, 0.75, {
			opacity    : 0,
			y          : '-30px',
			ease       : Power2.easeOut,
			delay      : payload.duration * 0.001,
			onComplete : onComplete
		});
	}

	componentWillUnmount() {
		this.timeline = null;
	}


	render() {
		console.log('Popup.render()', this.props, this.state);

		if (this.timeline) {
			this.timeline.restart();
		}

		const { payload } = this.props;
		const icon = (payload.type === 'ERROR') ? errorIcon : infoIcon;

		return (
			<div className="popup-wrapper" ref={(div)=> this.wrapper = div}>
				<Row>
					<Column><img src={icon} className="popup-icon" alt={capitalizeText(payload.type, true)} /></Column>
					<Column className="popup-content">
						<Row vertical="center" className="popup-text">{payload.content}</Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default Popup;