
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
					<div className="intro-text">Instantly use AI to design</div>
					<button className="action-button intro-button" onClick={()=> this.props.onClick()}>Get Started</button>
					<img src="/images/macbook.png" className="intro-image" alt="MacBook" />
				</Column>
			</Row>
		);
	}
}

export default GetStartedStep;
