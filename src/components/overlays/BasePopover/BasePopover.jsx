
import React, { Component } from 'react';
import './BasePopover.css';

import { TimelineMax, Back, Circ } from 'gsap/TweenMax';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import onClickOutside from 'react-onclickoutside';

import { PopoverDuration, PopoverLabel } from './';

class BasePopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fixed    : true,
			duration : {
				intro : PopoverDuration.INTRO_DURATION,
				outro : PopoverDuration.OUTRO_DURATION
			},
			position : {
				x : null,
				y : null
			},
			// offset   : null,
			offset   : {
				right  : null,
				buttom : null
			},
			size     : {
				width  : null,
				height : null
			},
			intro : true,
			outro : false
		};

		this.wrapper = React.createRef();
	}

	componentDidMount() {
 		// console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state, { ...this.state, ...this.props});

		const { payload } = this.props;
		const { intro, outro } = { ...this.state, ...this.props };
		const { fixed, duration, position, offset, size } = { ...this.state, ...payload };

		// const {
		// 	fixed = this.state.fixed,
		// 	duration = this.state.duration,
		// 	position = this.state.position,
		// 	offset = this.state.offset,
		// 	size = this.state.size
		// } = (this.props.payload) ? Object.assign({}, this.state, this.props.payload) : this.state;

		this.timeline = new TimelineMax();
		this.setState({ fixed, duration, position, offset, size, intro, outro }, ()=> {
 			console.log('%s.componentDidMount()', this.constructor.name, { props : this.props, state : this.state, fixed, duration, position, size, intro, outro });
			if (intro) {
				this.onIntro();
			}
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// console.log('%s.componentDidUpdate()', this.constructor.name, { prevPos : prevProps.payload.position,currPos : prevProps.outro }, { intro : this.props.intro, outro : this.props.outro }, { intro : prevState.intro, outro : prevState.outro }, { intro : this.state.intro, outro : this.state.outro });
// console.log('%s.componentDidUpdate()', this.constructor.name, { prevPosition : prevProps.payload.position, currPosition : this.props.payload.position }, { statePosition : this.state.position });

		// const { position } = this.props.payload;
		// const { intro, outro } = this.state;

// console.log('::POS::', { position : (position !== null), initStatePos :  (this.state.position.x !== 0 && this.state.position.y !== 0), prevPos : (position !== prevProps.payload.position), statePos : (position !== this.state.position) });
// console.log('::POS::', { props : position, state : this.state.position });

// 		if (position && (this.state.position.x !== 0 && this.state.position.y !== 0) && position !== prevProps.payload.position && position !== this.state.position) {
// 			this.setState({ position }, ()=> {
// 				this.onPosition();
// 			});
// 		}

		if (this.props.intro && this.props.intro !== prevProps.intro && !this.props.outro) {
// console.log('%s.componentDidUpdate() - intro > true', this.constructor.name, this.props.intro, intro);
				this.onIntro();
// 			this.setState({ intro : true });
		}

		if (this.props.outro && this.props.outro !== prevProps.outro && !this.props.intro) {
// console.log('%s.componentDidUpdate() - outro true', this.constructor.name, this.props.outro, outro);
			this.onOutro();
// 			this.setState({ outro : true });
		}


// 		if (intro && prevState.intro !== intro) {
// 			this.onIntro();
// 		}
//
// 		if (outro && prevState.outro !== outro) {
// 			this.onOutro();
// 		}
	}

	componentWillUnmount() {
// console.log('%s.componentWillUnmount()', this.constructor.name);
		this.timeline = null;
		this.wrapper = null;
	}

	handleClickOutside(event) {
// console.log('%s.handleClickOutside()', this.constructor.name);
// 		this.setState({ outro : true });
		this.onOutro();
	}


	onIntro = ()=> {
// console.log('%s.onIntro()', this.constructor.name, this.props, this.state.intro);

		const { duration } = this.state;
		this.timeline = new TimelineMax();
		this.timeline.addLabel(PopoverLabel.START_LBL, '0').from(this.wrapper, duration.intro, {
			opacity : 0.0,
			y       : 5,
			ease    : Back.easeOut,
			delay   : 0.0,
			onComplete : ()=> {
// 				this.setState({ intro : false });
			}
		});
	};

	onOutro = ()=> {
// console.log('%s.onOutro()', this.constructor.name, this.props, this.state.outro);

		const { duration } = this.state;
		this.timeline = new TimelineMax();
		this.timeline.to(this.wrapper, duration.outro, {
			opacity    : 0,
			scale      : 0.95,
			ease       : Circ.easeOut,
			onComplete : this.onOutroComplete
		}).addLabel(PopoverLabel.END_LBL);
	};

	onPosition = ()=> {
//  console.log('%s.onPosition()', this.constructor.name, this.state.position);

    const { duration, position } = this.state;
    this.timeline = new TimelineMax();
    this.timeline.to(this.wrapper, duration.outro, { ...position,
      ease : Circ.easeOut,
    });
	};

	onOutroComplete = ()=> {
// console.log('%s.onOutroComplete()', this.constructor.name);

		if (this.props.onOutroComplete) {
			this.props.onOutroComplete();
		}

// 		this.setState({ outro : false }, ()=> {
// 			if (this.props.onOutroComplete) {
// 				this.props.onOutroComplete();
// 			}
// 		});
	};

	render() {
		// console.log('%s.render()', this.constructor.name, { props : this.props, payload : this.props.payload, state : this.state.position });
		// console.log('%s.render()', this.constructor.name, this.props, this.state);
// 		if (this.wrapper && this.timeline && this.timeline.time === 0) {
// 			this.timeline.seek(0);
// 		}

		const { children } = this.props;
		const { fixed, position, offset, size, outro } = this.state;

		console.log('%s.render()', '::::::::__', this.constructor.name, { props : this.props, state : this.state, size : size || null, position : position || null, offset });

		// let prunedObj = {};
		// for (const k in offset) {
		// 	if (offset.hasOwnProperty(k)) {
		// 		const v = offset[k];
		// 		if (v !== null && v !== undefined) {
		// 			prunedObj[k] = v;
		// 		}
		// 	}
		// };



		// console.log('%s.render()', '::::::::__', this.constructor.name, { props : this.props, state : this.state, size : size || null, position : position || null, offset : offset || null, offsetVals : Object.values(offset), prunedObj });


		// const styles = { ...((!offset) ? {
		const styles = { ...((Object.values(offset).every((val)=> (val === null))) ? {
			left   : `${((position.x || 0) << 0)}px`,
			top    : `${((position.y || 0) << 0)}px`
		} : {
			right  : `${((offset.right || 0) << 0)}px`,
			bottom : `${((offset.bottom || 0) << 0)}px`,
			// right  : (isNaN(offset.right)) ? offset.right : `${(offset.right || 0)}px`,
			// bottom : (isNaN(offset.bottom)) ? offset.bottom : `${(offset.bottom || 0)}px`,
		}),
			width  : (Object.values(size).every((val)=> (val === null))) ? 'fit-content' : `${(size.width << 0)}px`,
			height : (Object.values(size).every((val)=> (val === null))) ? 'fit-content' : `${(size.height << 0)}px`,
		};


		// const styles = {
		// 	left   : (!offset) ? `${position.x}px` : `0px`,
		// 	top    : (!offset) ? `${position.y}px` : `0px`,
		// 	right  : (offset.right !== undefined) ? `${offset.right}px` : `0px`,
		// 	bottom : (offset.bottomm !== undefined) ? `${offset.bottom}px` : `0px`,
		// 	width  : (size.width * size.height === 0) ? 'fit-content' : `${size.width}px`,
		// 	height : (size.width * size.height === 0) ? 'fit-content' : `${size.height}px`,
		// };
//
		// console.log('::::::::__', { position, offset, styles });

		console.log('%s.render()', '::::::::__', this.constructor.name, { props : this.props, state : this.state, size, position, offset, offsetVals : Object.values(offset).every((val)=> (val === null)), styles });
		return (<div className="base-popover" style={styles} ref={(element)=> { this.wrapper = element; }} data-position={(fixed) ? 'fixed' : 'abs'}>
			<KeyboardEventHandler isDisabled={(!outro)} handleKeys={['esc']} onKeyEvent={(key, event)=> this.onOutro()}>
			<div className="content-wrapper">{children}</div>
			</KeyboardEventHandler>
		</div>);
	}
}


export default (onClickOutside(BasePopover));
// export default (BasePopover);



/*
import { TimelineMax,
	Power0, Power1, Power2, Power3, Power4, Linear,
	Back, Elastic, Bounce, RoughEase, SlowMo, SteppedEase, Circ, Expo, Sine, ExpoScaleEase
} from 'gsap/TweenMax';
 */
