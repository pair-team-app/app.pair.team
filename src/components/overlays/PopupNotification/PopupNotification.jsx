
import React, { Component } from 'react';
import './PopupNotification.css'

import { TimelineMax, Back, Circ, Expo } from 'gsap/TweenMax';

import { POPUP_TYPE_ERROR, POPUP_TYPE_OK, POPUP_TYPE_STATUS } from './';
import { POPUP_POSITION_EMBEDDED, POPUP_POSITION_TOPMOST } from './';


const START_LBL = 'START';
const END_LBL = 'END';
const ORTHODOX_DELAY = 0;
const ORTHODOX_DURATION = 1000 * (1 + (1/8));
const INTRO_DURATION = 1000 * (1/10);
const OUTRO_DURATION = 1000 * (2/3);


class PopupNotification extends Component {
	constructor(props) {
// 		console.log('%s.constructor()', this.constructor.name, props);

		super(props);
		this.state = {
		};

		this.wrapper = null;
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state, this.timeline, this.wrapper);

		const { payload, onComplete } = this.props;
		const { position } = Object.assign({}, { position : POPUP_POSITION_TOPMOST }, payload);
// 		const { top } = Object.assign({}, { top : (((position === POPUP_POSITION_TOPMOST) << 0) * -64) }, payload.offset);
		const { delay, duration } = Object.assign({}, {
			delay    : ORTHODOX_DELAY,
			duration : ORTHODOX_DURATION
		}, payload);

// 		console.log('%s.componentDidMount()', this.constructor.name, { position, top, delay, duration });

		this.timeline = new TimelineMax();
		this.timeline.addLabel(START_LBL, '0').from(this.wrapper, (INTRO_DURATION * 0.001), {
      opacity : ((position === POPUP_POSITION_TOPMOST) << 0) * 0.75,
// 			y          : (position === POPUP_POSITION_TOPMOST) ? `${top - 38}px` : `${top + 7}px`,
      y       : '+=38px',
			height  : (position === POPUP_POSITION_TOPMOST) ? `38px` : '22px',
      ease    : (position === POPUP_POSITION_TOPMOST) ? Back.easeOut : Circ.easeOut,
      delay   : (delay * 0.001)

		}).to(this.wrapper, (OUTRO_DURATION * 0.001), {
			opacity    : 0.0,
			ease       : Expo.easeInOut,
			delay      : (duration * 0.001),
			onComplete : onComplete
		}).addLabel(END_LBL);
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name, this.props, this.state, this.timeline, this.wrapper);
		this.timeline = null;
	}

	render() {
		console.log('%s.render()', this.constructor.name, { props : this.props, state : this.state, timeline : this.timeline, wrapper : this.wrapper });
		// console.log('%s.render()', this.constructor.name, this.timeline);

// 		if (this.wrapper && this.timeline) {
// 			this.timeline.seek(0);
// 		}

		const { payload, children } = this.props;
		const { position, type } = Object.assign({}, {
			position : POPUP_POSITION_TOPMOST,
			type     : POPUP_TYPE_STATUS
		}, payload);

		const offset = Object.assign({}, {
			top   : ((position === POPUP_POSITION_TOPMOST) << 0) * -64,
			left  : 0,
			right : 0
		}, payload.offset);

		const wrapperStyle = {
			width     : (offset.right !== 0) ? `calc(100% - ${offset.right}px)` : '100%',
// 			transform : `translate(${offset.left}px, ${offset.top}px)`
// 			transform : `translate(${offset.left}px, 38px)`
		};

		return (<div className="popup-notification" data-embedded={(position === POPUP_POSITION_EMBEDDED)} style={wrapperStyle} ref={(element)=> { this.wrapper = element; }}>
			<div className="content" data-type={(type === POPUP_TYPE_OK) ? 'ok' : (type === POPUP_TYPE_ERROR) ? 'error' : 'status'}>
				{children}
			</div>
		</div>);
	}


// 	componentDidCatch(error, errorInfo) {
// 		console.log('%s.componentDidCatch()', this.constructor.name, error, errorInfo, this.props, this.state, this.timeline, this.wrapper);
// 	}
// 	componentWillMount() {
// 		console.log('%s.componentWillMount()', this.constructor.name, this.props, this.state, this.timeline, this.wrapper);
// 	}
// 	componentWillUpdate(nextProps, nextState, nextContext) {
// 		console.log('%s.componentWillUpdate()', this.constructor.name, this.props, nextProps, this.state, nextState, nextContext, this.timeline, this.wrapper);
// 	}
// 	componentWillReceiveProps(nextProps, nextContext) {
// 		console.log('%s.componentWillReceiveProps()', this.constructor.name, this.props, nextProps, this.state, nextContext, this.timeline, this.wrapper);
// 	}
// 	shouldComponentUpdate(nextProps, nextState, nextContext) {
// 		console.log('%s.shouldComponentUpdate()', this.constructor.name, this.props, nextProps, this.state, nextState, nextContext, this.timeline, this.wrapper);
// 		return (true);
// 	}
// 	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, prevState, this.state, snapshot, this.timeline, this.wrapper);
// 	}

}


export default (PopupNotification);
