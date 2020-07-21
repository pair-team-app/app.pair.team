
import React, { Component } from 'react';
import './BasePopover.css';

import { TimelineMax, Back, Circ } from 'gsap/TweenMax';
import onClickOutside from 'react-onclickoutside';

const INTRO_DURATION = (1/8);
const OUTRO_DURATION = (1/4);
const START_LBL = 'START_LBL';
const END_LBL = 'END_LBL';


class BasePopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fixed    : true,
			duration : {
				intro : INTRO_DURATION,
				outro : OUTRO_DURATION
			},
			position : {
				x : 0,
				y : 0
			},
			offset   : null,
			size     : {
				width  : 0,
				height : 0
			},
			intro : true,
			outro : false
		};

		this.wrapper = React.createRef();
	}

	componentDidMount() {
 		// console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state, { ...this.state, ...this.props});

		const { intro, outro } = { ...this.state, ...this.props };
		const { 
			fixed = this.state.fixed, 
			duration = this.state.duration, 
			position = this.state.position, 
			offset = this.state.offset, 
			size = this.state.size 
		} = (this.props.payload) ? Object.assign({}, this.state, this.props.payload) : this.state;

		this.timeline = new TimelineMax();
		this.setState({ fixed, duration, position, offset, size, intro, outro }, ()=> {
 			// console.log({ fixed, duration, position, size, intro, outro });
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
		this.timeline.addLabel(START_LBL, '0').from(this.wrapper, duration.intro, {
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
		}).addLabel(END_LBL);
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
		const { fixed, position, offset, size } = this.state;


		const styles = { ...((!offset) ? {
			left   : `${position.x}px`,
			top    : `${position.y}px`
		} : {
			right  : (isNaN(offset.right)) ? offset.right : `${(offset.right || 0)}px`,
			bottom : (isNaN(offset.bottom)) ? offset.bottom : `${(offset.bottom || 0)}px`,
		}),  
			width  : (size.width * size.height === 0) ? 'fit-content' : `${size.width}px`,
			height : (size.width * size.height === 0) ? 'fit-content' : `${size.height}px`,
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

		return (<div className={`base-popover${(fixed) ? ' base-popover-fixed' : ' base-popover-abs'}`} style={styles} ref={(element)=> { this.wrapper = element; }}>
			<div className="base-popover-content-wrapper">{children}</div>
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
