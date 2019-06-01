
import React, { Component } from 'react';
import './PopupNotification.css'

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import { Row } from 'simple-flexbox';

export const POPUP_TYPE_ERROR = 'POPUP_TYPE_ERROR';
export const POPUP_TYPE_OK = 'POPUP_TYPE_OK';
export const POPUP_TYPE_STATUS = 'POPUP_TYPE_STATUS';

export const POPUP_POSITION_EMBEDDED = 'POPUP_POSITION_EMBEDDED';
export const POPUP_POSITION_TOPMOST = 'POPUP_POSITION_TOPMOST';

const START_LBL = 'START';
const END_LBL = 'END';
const ORTHODOX_DELAY = 1000 * (1/3);
const ORTHODOX_DURATION = 1000 * (1 + (1/8));
const INTRO_DURATION = 1000 * (1/10);
const OUTRO_DURATION = 1000 * (2/3);


class PopupNotification extends Component {
	constructor(props) {
// 		console.log('PopupNotification.constructor()', props);

		super(props);
		this.state = {
		};

		this.wrapper = null;
	}

	componentDidMount() {
// 		console.log('PopupNotification.componentDidMount()', this.props, this.state, this.timeline, this.wrapper);

		const { payload, onComplete } = this.props;
		const { position } = Object.assign({}, { position : POPUP_POSITION_EMBEDDED }, payload);
		const { top } = Object.assign({}, { top : (((position === POPUP_POSITION_TOPMOST) << 0) * -64) }, payload.offset);
		const { delay, duration } = Object.assign({}, {
			delay    : ORTHODOX_DELAY,
			duration : ORTHODOX_DURATION
		}, payload);

		this.timeline = new TimelineMax();
		this.timeline.addLabel(START_LBL, '0').from(this.wrapper, (INTRO_DURATION * 0.001), {
			opacity    : 0.0,
			y          : `${top + 7}px`,
			height     : '22px',
			ease       : Power1.easeIn,
			delay      : (delay * 0.001)

		}).to(this.wrapper, (OUTRO_DURATION * 0.001), {
			opacity    : 0.0,
			ease       : Power2.easeOut,
			delay      : (duration * 0.001),
			onComplete : onComplete
		}).addLabel(END_LBL);
	}

	componentWillUnmount() {
// 		console.log('PopupNotification.componentWillUnmount()', this.props, this.state, this.timeline, this.wrapper);
		this.timeline = null;
	}

	render() {
// 		console.log('PopupNotification.render()', this.props, this.state, this.timeline, this.wrapper);

		if (this.wrapper && this.timeline) {
			this.timeline.seek(0);
		}

		const { payload, children } = this.props;
		const { position, type } = Object.assign({}, {
			position : POPUP_POSITION_EMBEDDED,
			type     : POPUP_TYPE_OK
		}, payload);

		const offset = Object.assign({}, {
			top   : ((position === POPUP_POSITION_TOPMOST) << 0) * -64,
			left  : 0,
			right : 0
		}, payload.offset);

		const wrapperClass = `popup-notification-wrapper${(position === POPUP_POSITION_TOPMOST) ? ' popup-notification-wrapper-topmost' : ''}`;
		const className = `popup-notification-content${(type === POPUP_TYPE_OK) ? ' popup-notification-content-ok' : (type === POPUP_TYPE_ERROR) ? ' popup-notification-content-error' : ' popup-notification-content-status'}`;
		const wrapperStyle = {
			width     : (offset.right !== 0) ? `calc(100% - ${offset.right}px)` : '100%',
			transform : `translate(${offset.left}px, ${offset.top}px)`
		};

		return (
			<div className={wrapperClass} style={wrapperStyle} ref={(element)=> { this.wrapper = element; }}>
				<Row vertical="center" horizontal="center" className={className}>
					{children}
				</Row>
			</div>
		);
	}


// 	componentDidCatch(error, errorInfo) {
// 		console.log('PopupNotification.componentDidCatch()', error, errorInfo, this.props, this.state, this.timeline, this.wrapper);
// 	}
// 	componentWillMount() {
// 		console.log('PopupNotification.componentWillMount()', this.props, this.state, this.timeline, this.wrapper);
// 	}
// 	componentWillUpdate(nextProps, nextState, nextContext) {
// 		console.log('PopupNotification.componentWillUpdate()', this.props, nextProps, this.state, nextState, nextContext, this.timeline, this.wrapper);
// 	}
// 	componentWillReceiveProps(nextProps, nextContext) {
// 		console.log('PopupNotification.componentWillReceiveProps()', this.props, nextProps, this.state, nextContext, this.timeline, this.wrapper);
// 	}
// 	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('PopupNotification.shouldComponentUpdate()', this.props, nextProps, this.state, nextState, nextContext, this.timeline, this.wrapper);
// 		return (true);
// 	}
// 	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('PopupNotification.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot, this.timeline, this.wrapper);
// 	}

}

export default PopupNotification;
