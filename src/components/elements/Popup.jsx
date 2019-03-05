
import React, { Component } from 'react';
import './Popup.css'

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import { Row } from 'simple-flexbox';

const START_LBL = 'START';
const END_LBL = 'END';

export const POPUP_TYPE_ERROR = 'POPUP_TYPE_ERROR';
export const POPUP_TYPE_OK = 'POPUP_TYPE_OK';
export const POPUP_TYPE_STATUS = 'POPUP_TYPE_STATUS';

const ORTHODOX_DELAY = (2/3);
const ORTHODOX_DURATION = 1.125;


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
		const { delay, duration } = payload;
		const { top } = Object.assign({}, { top : 0 }, payload.offset);

		this.timeline = new TimelineMax();
		this.timeline.addLabel(START_LBL, '0').from(this.wrapper, 0.1, {
			opacity    : 0.0,
			y          : `${top + 7}px`,
			height     : '22px',
			ease       : Power1.easeIn

		}).to(this.wrapper, (delay) ? delay * 0.001 : ORTHODOX_DELAY, {
			opacity    : 0.0,
			ease       : Power2.easeOut,
			delay      : (duration) ? duration * 0.001 : ORTHODOX_DURATION,
			onComplete : onComplete
		}).addLabel(END_LBL);
	}

	componentWillUnmount() {
		this.timeline = null;
	}

	render() {
// 		console.log('Popup.render()', this.props, this.state, this.timeline);

		if (this.timeline) {
			this.timeline.seek(0);
		}

		const { payload, children } = this.props;
		const { type } = payload;
		const offset = Object.assign({}, {
			top   : 0,
			left  : 0,
			right : 0
		}, payload.offset);

		const className = `popup-content${(type === POPUP_TYPE_OK) ? ' popup-content-ok' : (type === POPUP_TYPE_ERROR) ? ' popup-content-error' : ' popup-content-status'}`;
		const style = {
			width     : (offset.right !== 0) ? `calc(100% - ${offset.right}px)` : '100%',
			transform : `translate(${offset.left}px, ${offset.top}px)`
		};

		return (
			<div className="popup-wrapper" style={style} ref={(element)=> { this.wrapper = element; }}>
				<Row vertical="center" horizontal="center" className={className}>
					{children}
				</Row>
			</div>
		);
	}
}

export default Popup;
