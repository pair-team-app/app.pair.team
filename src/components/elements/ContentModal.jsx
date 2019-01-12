
import React, { Component } from 'react';
import './ContentModal.css';

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';


class ContentModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};

		this.wrapper = null;
	}

	componentDidMount() {
		console.log('ContentModal.componentDidMount()', this.props, this.state);

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, 0.125, {
			opacity : 0,
			ease    : Power1.easeIn
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('ContentModal.componentDidUpdate()', prevProps, this.props, this.state);

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
		console.log('ContentModal.componentWillUnmount()');
		this.timeline = null;
	}

	handleClick = ()=> {
		this.setState({ outro : true });
	};

	render() {
		console.log('ContentModal.render()', this.props, this.state);

		const { content } = this.props;

		return (<div className="content-modal-wrapper" onClick={()=> this.handleClick()} ref={(element)=> { this.wrapper = element; }}>
			<div className="content-modal-content">
				<span dangerouslySetInnerHTML={{ __html : content }} /><br />
				<button className="content-modal-button" onClick={()=> this.handleClick()}>OK</button>
			</div>
		</div>);
	}
}


export default ContentModal;
