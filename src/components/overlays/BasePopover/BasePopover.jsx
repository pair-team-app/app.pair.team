
import React, { Component } from 'react';
import './BasePopover.css';

import { TimelineMax, Circ, Power1 } from 'gsap/TweenMax';
import onClickOutside from 'react-onclickoutside';
import { connect } from 'react-redux';

const INTRO_DURATION = (1/8);
const OUTRO_DURATION = (1/4);
const START_LBL = 'START_LBL';
// const END_LBL = 'END_LBL';


class BasePopover extends Component {
	constructor(props) {
		super(props);

		this.state = {
			duration : {
				intro : INTRO_DURATION,
				outro : OUTRO_DURATION
			},
			position : { ...this.props.mouse.position },
			size     : {
				width  : 0,
				height : 0
			},
			outro : false
		};

		this.wrapper = React.createRef();
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { duration, position, size } = { ...this.state, ...this.props.payload};
		this.setState({ duration, position, size }, ()=> {
			console.log(duration, position, size);

			this.timeline = new TimelineMax();
			this.timeline.addLabel(START_LBL, '0').from(this.wrapper, duration.intro, {
				opacity : 0.0,
				y       : 10,
				ease    : Circ.easeOut,
				delay   : 0.0
			});
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state);

		if (this.props.outro && prevProps.outro !== this.props.outro) {
			this.setState({ outro : true });
		}

		if (this.state.outro) {
			this.setState({ outro : false });
			this.timeline = new TimelineMax();
			this.timeline.to(this.wrapper, this.state.duration.outro, {
				opacity    : 0,
				ease       : Power1.easeOut,
				onComplete : this.onOutroComplete
			});
		}
	}

	componentWillUnmount() {
		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.timeline = null;
	}

	handleClickOutside(event) {
		console.log('%s.handleClickOutside()', this.constructor.name);
		this.setState({ outro : true });
	}


	onOutroComplete = ()=> {
		console.log('%s.onOutroComplete()', this.constructor.name);
		if (this.props.onOutroComplete) {
			this.props.onOutroComplete();
		}
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state);
		if (this.wrapper && this.timeline && this.timeline.time === 0) {
			this.timeline.seek(0);
		}

		const { children } = this.props;
		const { position, size } = this.state;

		const styles = {
			left   : `${position.x}px`,
			top    : `${position.y}px`,
			width  : (size.width * size.height === 0) ? 'fit-content' : `${size.width}px`,
			height : (size.width * size.height === 0) ? 'fit-content' : `${size.height}px`,
		};

		return (<div className="base-popover" style={styles} ref={(element)=> { this.wrapper = element; }}>
			<div className="base-popover-content-wrapper">{children}</div>
		</div>);
	}
}


const mapStateToProps = (state, ownProps)=> {
	return ({
		mouse : state.mouse
	});
};


export default connect(mapStateToProps)(onClickOutside(BasePopover));



/*
import { TimelineMax,
	Power0, Power1, Power2, Power3, Power4, Linear,
	Back, Elastic, Bounce, RoughEase, SlowMo, SteppedEase, Circ, Expo, Sine, ExpoScaleEase
} from 'gsap/TweenMax';
 */