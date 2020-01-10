
import React, { Component } from 'react';
import './BaseOverlay.css';

import { TimelineMax, Back } from 'gsap/TweenMax';
import onClickOutside from 'react-onclickoutside';

import { trackOverlay } from '../../../utils/tracking';

import { OVERLAY_TYPE_POSITION_OFFSET, OVERLAY_TYPE_PERCENT_SIZE } from './';


const INTRO_DURATION = (1/8);
const OUTRO_DURATION = (1/4);


class BaseOverlay extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};

    this.timeline = new TimelineMax();
		this.wrapper = null;
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { tracking, delay } = this.props;
		trackOverlay(`open${tracking}`);
		this.onIntro();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state);
		console.log('%s.componentDidUpdate()', this.constructor.name, { prevProps : prevProps.outro, props : this.props.outro });

    if (prevProps.outro !== this.props.outro && !this.props.outro) {
// 			this.setState({ outro : false }, ()=> {
				this.onIntro();
// 			});
    }

		if (prevProps.outro !== this.props.outro && this.props.outro) {
// 			this.setState({ outro : true }, ()=> {
				this.onOutro();
// 			});
		}

// 		if (this.state.outro) {
// 			this.setState({ outro : false });
// 			this.onOutro();
// 		}
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		const { tracking } = this.props;
		trackOverlay(`close${tracking}`);

		this.timeline = null;
	}

	handleClickOutside(event) {
		const { closeable } = this.props;
		if (closeable) {
			this.setState({ outro : true }, ()=> {
				this.onOutro();
			});
		}
	}

	handleClose = ()=> {
// 		console.log('%s.handleClose()', this.constructor.name, this.props);
		this.setState({ outro : true }, ()=> {
			this.onOutro();
		});
	};

	onIntro = ()=> {
    console.log('%s.onIntro()', this.constructor.name, this.props, this.state, this.timeline);

    const { tracking, delay } = this.props;
    trackOverlay(`open${tracking}`);

    this.timeline = new TimelineMax();
    this.timeline.from(this.wrapper, INTRO_DURATION, {
      opacity : 0.5,
      scale   : 0.75,
      ease    : Back.easeOut,
      delay   : (delay || 0) * 0.001
    });
	};

	onOutro = ()=> {
    console.log('%s.onOutro()', this.constructor.name, this.props, this.state, this.timeline);

    const { onComplete } = this.props;

//     this.timeline = new TimelineMax();
    this.timeline.to(this.wrapper, OUTRO_DURATION, {
      scale      : 0.9,
      opacity    : 0,
      ease       : Back.easeIn,
      onComplete : onComplete
    });
	};

	render() {
// 		console.log('%s.render()', this.constructor.name, this.props, this.state, this.timeline);

		if (this.wrapper && this.timeline && this.timeline.time === 0) {
			this.timeline.seek(0);
		}

		const { type, offset, title, closeable, children } = this.props;
		const wrapperClass = `base-overlay-content-wrapper base-overlay-content-wrapper${(type === OVERLAY_TYPE_PERCENT_SIZE) ? '-percent' : '-auto-scroll'}`;
		const wrapperStyle = (type === OVERLAY_TYPE_POSITION_OFFSET) ? {
			transform  : `translate(${(offset.x || 0)}px, ${(offset.y || 0)}px)`
		} : null;


		return (<div className={`base-overlay${(!closeable) ? ' base-overlay-blocking' : ''}`} onClick={(closeable) ? this.handleClose : null}>
			<div className={wrapperClass} style={wrapperStyle} onClick={(event)=> event.stopPropagation()} ref={(element)=> { this.wrapper = element; }}>
				{(title) && (<div className="base-overlay-header-wrapper">
					<div className="base-overlay-title">{title}</div>
				</div>)}
				<div className="base-overlay-content">{children}</div>
			</div>
		</div>);
	}
}


export default onClickOutside(BaseOverlay);
