
import React, { Component } from 'react';
import './BaseOverlay.css';

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import { Column, Row } from 'simple-flexbox';

import { trackOverlay } from '../../../../utils/tracking';

export const OVERLAY_SIZED_AUTO = 'OVERLAY_SIZED_AUTO';
export const OVERLAY_SIZED_FIXED = 'OVERLAY_SIZED_FIXED';
export const OVERLAY_SIZED_PERCENTAGE = 'OVERLAY_SIZED_PERCENTAGE';

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
// 		console.log('BaseOverlay.componentDidMount()', this.props, this.state);

		const { tracking } = this.props;
		trackOverlay(tracking);

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, INTRO_DURATION, {
			opacity : 0,
			ease    : Power1.easeIn
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('BaseOverlay.componentDidUpdate()', prevProps, this.props, this.state);

		if (prevProps.outro !== this.props.outro && this.props.outro) {
			this.setState({ outro : true });
		}

		if (this.state.outro) {
			this.setState({ outro : false });
			const { onComplete } = this.props;

			this.timeline = new TimelineMax();
			this.timeline.to(this.wrapper, OUTRO_DURATION, {
				opacity    : 0,
				ease       : Power2.easeOut,
				onComplete : onComplete
			});
		}
	}

	componentWillUnmount() {
// 		console.log('BaseOverlay.componentWillUnmount()');
		this.timeline = null;
	}

	handleClickOutside(event) {
		const { closeable } = this.props;
		if (closeable) {
			this.setState({ outro : true });
		}
	}

	handleClose = ()=> {
// 		console.log('BaseOverlay.handleClose()', this.props);
		this.setState({ outro : true });
	};

	render() {
// 		console.log('BaseOverlay.render()', this.props, this.state);

		if (this.wrapper && this.timeline && this.timeline.time === 0) {
			this.timeline.seek(0);
		}

		const { type, size, unblurred, title, closeable, defaultButton, children } = this.props;
		const wrapperClass = `base-overlay-content-wrapper base-overlay-content-wrapper${(type === OVERLAY_SIZED_FIXED) ? '-fixed' : (type === OVERLAY_SIZED_PERCENTAGE) ? '-percent' : '-auto'}${(unblurred) ? ' base-overlay-content-wrapper-unblurred' : ''}`;


		const wrapperStyle = (type === OVERLAY_SIZED_FIXED) ? {
			width : size.width,
			height : size.height
		} : null;


		return (<div className="base-overlay-wrapper" onClick={(closeable) ? this.handleClose : null} ref={(element)=> { this.wrapper = element; }}>
			<div className={wrapperClass} style={wrapperStyle} onClick={(event)=> event.stopPropagation()}>
				{(title) && (<div className="base-overlay-header-wrapper"><Row>
					<Column flexGrow={1}><div className="base-overlay-title">{title}</div></Column>
					<Column flexGrow={1} vertical="center" horizontal="end">{(closeable && !defaultButton) && (<button className="tiny-button base-overlay-close-button" onClick={this.handleClose}><FontAwesome name="times"/></button>)}</Column>
				</Row></div>)}
				<div className="base-overlay-content">
					{children}
					{(defaultButton) && (<div className="base-overlay-button-wrapper">
						<button className="base-overlay-button" onClick={this.handleClose}>{defaultButton}</button>
					</div>)}
				</div>
			</div>
		</div>);
	}
}


export default onClickOutside(BaseOverlay);
