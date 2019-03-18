
import React, { Component } from 'react';
import './ContentModal.css';

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';
import { Column, Row } from 'simple-flexbox';

import { trackModal } from '../../utils/tracking';


export const MODAL_SIZE_AUTO = 'MODAL_SIZE_AUTO';
export const MODAL_SIZE_FIXED = 'MODAL_SIZE_FIXED';
export const MODAL_SIZE_PERCENT = 'MODAL_SIZE_PERCENT';

const INTRO_DURATION = (1/8);
const OUTRO_DURATION = (1/4);

class ContentModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};

		this.wrapper = null;
	}

	componentDidMount() {
// 		console.log('ContentModal.componentDidMount()', this.props, this.state);

		const { tracking } = this.props;
		trackModal(tracking);

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, INTRO_DURATION, {
			opacity : 0,
			ease    : Power1.easeIn
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('ContentModal.componentDidUpdate()', prevProps, this.props, this.state);

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
// 		console.log('ContentModal.componentWillUnmount()');
		this.timeline = null;
	}

	handleClickOutside(event) {
		const { closeable } = this.props;
		if (closeable) {
			this.setState({ outro : true });
		}
	}

	handleClose = ()=> {
// 		console.log('ContentModal.handleClose()', this.props);
		this.setState({ outro : true });
	};

	render() {
// 		console.log('ContentModal.render()', this.props, this.state);

		if (this.wrapper && this.timeline && this.timeline.time === 0) {
			this.timeline.seek(0);
		}

		const { size, title, closeable, defaultButton, children } = this.props;
		const wrapperClass = `content-modal-content-wrapper content-modal-content-wrapper${(size === MODAL_SIZE_FIXED) ? '-fixed' : (size === MODAL_SIZE_PERCENT) ? '-percent' : '-auto'}`;

		return (<div className="content-modal-wrapper" onClick={(closeable) ? this.handleClose : null} ref={(element)=> { this.wrapper = element; }}>
			<div className={wrapperClass} onClick={(event)=> event.stopPropagation()}>
				{(title) && (<div className="content-modal-header-wrapper"><Row>
					<Column flexGrow={1}><div className="content-modal-title">{title}</div></Column>
					<Column flexGrow={1} vertical="center" horizontal="end">{(closeable && !defaultButton) && (<button className="tiny-button content-modal-close-button" onClick={this.handleClose}><FontAwesome name="times"/></button>)}</Column>
				</Row></div>)}
				<div className="content-modal-content">
					{children}
					{(defaultButton) && (<div className="content-modal-button-wrapper">
						<button className="content-modal-button" onClick={this.handleClose}>{defaultButton}</button>
					</div>)}
				</div>
			</div>
		</div>);
	}
}


export default onClickOutside(ContentModal);
