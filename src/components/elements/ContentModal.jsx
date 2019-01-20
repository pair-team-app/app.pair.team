
import React, { Component } from 'react';
import './ContentModal.css';

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';
import FontAwesome from 'react-fontawesome';
import onClickOutside from 'react-onclickoutside';

class ContentModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};

		this.wrapper = null;
		this.handleClose = this.handleClose.bind(this);
	}

	componentDidMount() {
// 		console.log('ContentModal.componentDidMount()', this.props, this.state);

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, 0.125, {
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
			this.timeline.to(this.wrapper, 0.25, {
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
		console.log('ContentModal.handleClose()', this.props);

		const { closeable } = this.props;
		if (closeable) {
			this.setState({ outro : true });
		}
	};

	render() {
		console.log('ContentModal.render()', this.props, this.state);

		const { type, title, closeable, defaultButton, children } = this.props;
		const wrapperClass = (type === 'PERCENT') ? 'content-modal-content-wrapper content-modal-content-wrapper-percent' : 'content-modal-content-wrapper';

		return (<div className="content-modal-wrapper" onClick={()=> (closeable) ? this.handleClose() : null} ref={(element)=> { this.wrapper = element; }}>
			<div className={wrapperClass}>
				{(title) && (<div className="content-modal-title-wrapper">
					<h3>{title}</h3>
					{(closeable && !defaultButton) && (<button className="tiny-button content-modal-close-button" onClick={()=> this.handleClose()}><FontAwesome name="times"/></button>)}
				</div>)}
				<div className="content-modal-content">
					{children}
					{(defaultButton) && (<button className="content-modal-button" onClick={()=> this.handleClose()}>{defaultButton}</button>)}
				</div>
			</div>
		</div>);
	}
}


export default onClickOutside(ContentModal);
