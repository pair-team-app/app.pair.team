
import React, { Component } from 'react';
import './Tooltip.css'

// import { TweenMax, Expo } from "gsap/TweenMax";
import { Column, Row } from 'simple-flexbox';

class Tooltip extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.divWrapper = null;
	}

	componentDidMount() {
// 		let tween = TweenMax.to(this.divWrapper, 1, {
// 			opacity : 0,
// 			y       : '-20px',
// 			ease    : Expo.easeOut,
// 			delay   : 1.5
// 		});
	}

	render() {
		return (
			<div className="tooltip-wrapper" ref={div=> this.divWrapper = div}>
				<Row>
					<Column vertical="center"><div className="tooltip-icon">{this.props.content.ico}</div></Column>
					<Column className="tooltip-content">
						<Row vertical="center">{this.props.content.txt}</Row>
					</Column>
				</Row>
			</div>
		);
	}
}

export default Tooltip;
