
import React, { Component } from 'react';
import './Popup.css'

import { TweenMax, Expo } from "gsap/TweenMax";
import { Column, Row } from 'simple-flexbox';

const wrapper = React.createRef();

class Popup extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.wrapper = null;
	}

	componentDidMount() {
		let self = this;
		let tween = TweenMax.to(this.wrapper, 0.75, {
			opacity    : 0,
			y          : '-20px',
			ease       : Expo.easeOut,
			delay      : 1.125,
			onComplete : self.props.onComplete
		});
	}

	render() {
		return (
			<div className="popup-wrapper" ref={(div)=> this.wrapper = div}>
				<Row>
					<Column><img src="/images/copy-code.svg" className="popup-icon" alt={this.props.content} /></Column>
					<Column className="popup-content">
						<Row vertical="center" className="popup-text">{this.props.content}</Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default Popup;