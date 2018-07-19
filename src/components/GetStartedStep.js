
import React, { Component } from 'react';
import './GetStartedStep.css';

import { Column, Row } from 'simple-flexbox';


class GetStartedStep extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<Row vertical="start">
				<Column flexGrow={1} horizontal="center">
					<div className="step-header-text">Use AI to design a website or application</div>
					<div className="step-text">Accelerate your best designs with Design Engine’s AI powered Premium Design Templates.</div>
					<button className="action-button step-button" onClick={()=> this.props.onClick()}>Get Started</button>
					<img src="/images/macbook.png" className="intro-image" alt="MacBook" />
				</Column>
			</Row>
		);
	}
}

export default GetStartedStep;
