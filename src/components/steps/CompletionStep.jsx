
import React, { Component } from 'react';
import './CompletionStep.css'

// import axios from 'axios';
// import cookie from 'react-cookies';
import { Column, Row } from 'simple-flexbox';

import ContentModal from '../elements/ContentModal'

class CompletionStep extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isModal : false,
			modalContent: null
		};
	}


	render() {
		return (
			<div>
				<Row vertical="start">
					<Column flexGrow={1} horizontal="center">
						<div className="step-header-text">Select a Design System</div>
						<div className="step-text">Select a Premium Design System to begin editting.</div>
					</Column>
				</Row>
				{this.state.isModal && (
					<ContentModal content={this.state.modalContent} />
				)}
			</div>
		);
	}
}

export default CompletionStep;
