
import React, { Component } from 'react';
import './ProcessingStatus.css'

// import axios from 'axios';
// import cookie from 'react-cookies';
import { Row } from 'simple-flexbox';

class ProcessingStatus extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}

	render() {
		const status = this.props.status.map((item, i, arr) => {
			return (
				<Row key={i} horizontal="start" className="status-item">{item}</Row>
			);
		});

		return (
			<div className="processing-wrapper" onClick={()=> this.props.onClick()}>
				<div className="processing-content">
					{status}
				</div>
			</div>
		);
	}
}

export default ProcessingStatus;
