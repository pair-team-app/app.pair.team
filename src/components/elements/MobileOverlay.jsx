
import React, { Component } from 'react';
import './MobileOverlay.css';

import { TimelineMax, Power1, Power2 } from 'gsap/TweenMax';


class MobileOverlay extends Component {
	constructor(props) {
		super(props);

		this.state = {
			outro : false
		};

		this.wrapper = null;
	}

	componentDidMount() {
		console.log('MobileOverlay.componentDidMount()', this.props, this.state);

		this.timeline = new TimelineMax();
		this.timeline.from(this.wrapper, 0.25, {
			opacity : 0,
			ease    : Power1.easeIn
		});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('MobileOverlay.componentDidUpdate()', prevProps, this.props, this.state);

		if (this.state.outro) {
			this.setState({ outro : false });
			const { onComplete } = this.props;

			this.timeline = new TimelineMax();
			this.timeline.to(this.wrapper, 0.33, {
				opacity    : 0,
				ease       : Power2.easeOut,
				onComplete : onComplete
			});
		}
	}

	componentWillUnmount() {
		console.log('MobileOverlay.componentWillUnmount()');
		this.timeline = null;
	}

	handleClick = ()=> {
		this.setState({ outro : true });
	};

	render() {
		console.log('MobileOverlay.render()', this.props, this.state);

		return (<div className="mobile-overlay-wrapper" onClick={()=> this.handleClick()} ref={(element)=> { this.wrapper = element; }}>
			<div className="mobile-overlay-content">
				Sorry Design Engine is not ready for Mobile, head to your nearest desktop.<br />
				<button className="fat-button mobile-overlay-button" onClick={()=> this.handleClick()}>OK</button>
			</div>
		</div>);
	}
}


export default MobileOverlay;
