
import React, { Component } from 'react';
import './TutorialOverlay.css'

import { TweenMax, Elastic, Power0, Power1 } from 'gsap/TweenMax';
import { Column } from 'simple-flexbox';

import tutorialContent from '../../assets/json/tutorial-content';


class TutorialOverlay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			step  : -1,
			style : null
		};

		this.wrapper = null;
	}

	componentDidMount() {
// 		console.log('TutorialOverlay.componentDidMount()', this.props, this.state);
		this.onNextStep();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
// 		console.log('TutorialOverlay.componentDidUpdate()', prevProps, this.props, prevState, this.state, snapshot);

		if (prevProps.origin !== this.props.origin) {
			this.onNextStep();
		}
	}

	handleClose = ()=> {
		console.log('TutorialOverlay.handleClose()');

		const { onClose } = this.props;
		TweenMax.to(this.wrapper, 0.125, {
			opacity    : 0,
			scaleX     : 0.125,
			scaleY     : 0.125,
			ease       : Power0.easeOut,
			onComplete : onClose
		});
	};

	onNextStep = ()=> {
		console.log('TutorialOverlay.onNextStep()');

		const { origin } = this.props;
		let { step } = this.state;

		this.setState({
			step  : Math.min(Math.max(++step, 0), tutorialContent.length - 1),
			style : { transform : (origin.left.includes('%')) ? `translate(-${origin.left})` : 'none' }
		});

		let tween = {
			ease    : (step === 0) ? Elastic.easeOut : Power1.easeIn,
			delay   : (step === 0) ? 0.75 : 0.1,
			opacity : 1
		};

		Object.keys(origin).forEach((key)=> {
			tween[key] = origin[key];
		});

		TweenMax.to(this.wrapper, (step === 0) ? 0.875 : 0.25, tween);
	};

	render() {
// 		console.log('TutorialOverlay.render()', this.props, this.state);

		const { step, style } = this.state;
		return (
			<div className="tutorial-overlay-wrapper" style={style} ref={(element)=> { this.wrapper = element; }}>
				<Column horizontal="center">
					<div className="tutorial-overlay-content">{ tutorialContent[step]}</div>
					<div className="tutorial-overlay-button-wrapper">
						{(step < tutorialContent.length - 1) && (<button className="tiny-button tutorial-overlay-button adjacent-button" onClick={()=> this.props.onNext(step + 1)}>Next</button>)}
						<button className="tiny-button tutorial-overlay-button" onClick={()=> this.handleClose()}>Close</button>
					</div>
				</Column>
			</div>
		);
	}
}

export default TutorialOverlay;
