
import React, { Component } from 'react';
import './BasePopover.css';

import { TimelineMax, Back, Circ } from 'gsap/TweenMax';
import onClickOutside from 'react-onclickoutside';

const INTRO_DURATION = (1/8);
const OUTRO_DURATION = (1/8);
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
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { intro, outro } = { ...this.state, ...this.props};
		const { fixed, duration, position, size } = { ...this.state, ...this.props.payload};

		this.timeline = new TimelineMax();
		this.setState({ fixed, duration, position, size, intro, outro }, ()=> {
// 			console.log(fixed, duration, position, size, intro, outro);
			if (intro) {
				this.onIntro();
			}
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, { intro : prevProps.intro, outro : prevProps.outro }, { intro : this.props.intro, outro : this.props.outro }, { intro : prevState.intro, outro : prevState.outro }, { intro : this.state.intro, outro : this.state.outro });

		const { position } = this.props.payload;
		const { intro, outro } = this.state;

		if (position !== prevProps.payload.position) {
			this.setState({ position });
		}

		if (this.props.intro && this.props.intro !== prevProps.intro && !this.props.outro) {
			console.log('%s.componentDidUpdate() - intro > true', this.constructor.name, this.props.intro, intro);
				this.onIntro();
// 			this.setState({ intro : true });
		}

		if (this.props.outro && this.props.outro !== prevProps.outro && !this.props.intro) {
			console.log('%s.componentDidUpdate() - outro true', this.constructor.name, this.props.outro, outro);
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
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.timeline = null;
		this.wrapper = null;
	}

	handleClickOutside(event) {
// 		console.log('%s.handleClickOutside()', this.constructor.name);
// 		this.setState({ outro : true });
		this.onOutro();
	}


	onIntro = ()=> {
		console.log('%s.onIntro()', this.constructor.name, this.props, this.state.intro);

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
		console.log('%s.onOutro()', this.constructor.name, this.props, this.state.outro);

		const { duration } = this.state;
		this.timeline = new TimelineMax();
		this.timeline.to(this.wrapper, duration.outro, {
			opacity    : 0,
			scale      : 0.875,
			ease       : Circ.easeOut,
			onComplete : this.onOutroComplete
		}).addLabel(END_LBL);
	};


	onOutroComplete = ()=> {
// 		console.log('%s.onOutroComplete()', this.constructor.name);

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
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);
		if (this.wrapper && this.timeline && this.timeline.time === 0) {
			this.timeline.seek(0);
		}

		const { children } = this.props;
		const { fixed, position, size } = this.state;

		const styles = {
			left   : `${position.x}px`,
			top    : `${position.y}px`,
			width  : (size.width * size.height === 0) ? 'fit-content' : `${size.width}px`,
			height : (size.width * size.height === 0) ? 'fit-content' : `${size.height}px`,
		};

		return (<div className={`base-popover${(!fixed) ? ' base-popover-relative' : ''}`} style={styles} ref={(element)=> { this.wrapper = element; }}>
			<div className="base-popover-content-wrapper">{children}</div>
		</div>);
	}
}


export default (onClickOutside(BasePopover));



/*
import { TimelineMax,
	Power0, Power1, Power2, Power3, Power4, Linear,
	Back, Elastic, Bounce, RoughEase, SlowMo, SteppedEase, Circ, Expo, Sine, ExpoScaleEase
} from 'gsap/TweenMax';
 */