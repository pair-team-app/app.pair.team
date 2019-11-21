
import React, { Component } from 'react';
import './BaseOverlay.css';

import { TimelineMax, Power1, Circ } from 'gsap/TweenMax';
import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import { Column, Row } from 'simple-flexbox';

import { trackOverlay } from '../../../utils/tracking';

export const OVERLAY_TYPE_AUTO_SCROLL = 'OVERLAY_TYPE_AUTO_SCROLL';
export const OVERLAY_TYPE_FIXED_SIZE = 'OVERLAY_TYPE_FIXED_SIZE';
export const OVERLAY_TYPE_PERCENT_SIZE = 'OVERLAY_TYPE_PERCENT_SIZE';

const INTRO_DURATION = (1/8);
const OUTRO_DURATION = (1/4);


class BaseOverlay extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};

		this.wrapper = null;
	}

	componentDidMount() {
// 		console.log('%s.componentDidMount()', this.constructor.name, this.props, this.state);

		const { tracking } = this.props;
		trackOverlay(tracking);

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, INTRO_DURATION, {
			opacity : 0,
			ease    : Power1.easeOut,
			delay   : (this.props.delay || 0) * 0.001
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('%s.componentDidUpdate()', this.constructor.name, prevProps, this.props, this.state);

		if (prevProps.outro !== this.props.outro && this.props.outro) {
			this.setState({ outro : true });
		}

		if (this.state.outro) {
			this.setState({ outro : false });
			const { onComplete } = this.props;

			this.timeline = new TimelineMax();
			this.timeline.to(this.wrapper, OUTRO_DURATION, {
				scale      : 0.875,
				opacity    : 0,
				ease       : Circ.easeOut,
				onComplete : onComplete
			});
		}
	}

	componentWillUnmount() {
// 		console.log('%s.componentWillUnmount()', this.constructor.name);
		this.timeline = null;
	}

	handleClickOutside(event) {
		const { closeable } = this.props;
		if (closeable) {
			this.setState({ outro : true });
		}
	}

	handleClose = ()=> {
// 		console.log('%s.handleClose()', this.constructor.name, this.props);
		this.setState({ outro : true });
	};

	render() {
		console.log('%s.render()', this.constructor.name, this.props, this.state, this.timeline);

		if (this.wrapper && this.timeline && this.timeline.time === 0) {
			this.timeline.seek(0);
		}

		const { type, size, title, closeable, defaultButton, children } = this.props;
		const wrapperClass = `base-overlay-content-wrapper base-overlay-content-wrapper${(type === OVERLAY_TYPE_FIXED_SIZE) ? '-fixed' : (type === OVERLAY_TYPE_PERCENT_SIZE) ? '-percent' : '-auto-scroll'}`;
		const wrapperStyle = (type === OVERLAY_TYPE_FIXED_SIZE) ? {
			width  : size.width,
			height : size.height
		} : null;


		return (<div className="base-overlay" onClick={(closeable) ? this.handleClose : null} ref={(element)=> { this.wrapper = element; }}>
			<div className={wrapperClass} style={wrapperStyle} onClick={(event)=> event.stopPropagation()}>
				{(title) && (<div className="base-overlay-header-wrapper"><Row>
					<Column flexGrow={1}><div className="base-overlay-title">{title}</div></Column>
					{(closeable && !defaultButton) && (<Column horizontal="end"><button className="quiet-button base-overlay-close-button" onClick={this.handleClose}><FontAwesome name="times"/></button></Column>)}
				</Row></div>)}
				<div className="base-overlay-content">{children}</div>
				{(defaultButton) && (<div className="base-overlay-button-wrapper">
					<button onClick={this.handleClose}>{defaultButton}</button>
				</div>)}
			</div>
		</div>);
	}
}


export default onClickOutside(BaseOverlay);
